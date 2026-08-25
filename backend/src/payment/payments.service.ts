import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';

import { PocketFiBank, PocketFiService } from './pocketfi.service';
import { VirtualAccountRepository } from './virtual-account.repository';
import { WalletService } from '../wallet/wallet.service';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly virtualAccountRepo: VirtualAccountRepository,
    private readonly pocketfi: PocketFiService,
    private readonly walletService: WalletService,
    private readonly prisma: PrismaService,
  ) {}

  /*
  =====================================
      GET OR CREATE VIRTUAL ACCOUNT
      Static account — created once per user per bank, reused on every
      subsequent call. `phone` is required by PocketFi at creation
      time; the User model doesn't have a phone column, so the
      frontend collects/caches it and sends it each call (harmless —
      ignored once an account already exists).
  =====================================
  */
  async getOrCreateVirtualAccount(
    user: { id: string; email: string },
    bank: PocketFiBank,
    phone: string,
  ) {
    const existing = await this.virtualAccountRepo.findByUserAndBank(
      user.id,
      bank,
    );

    if (existing) {
      return existing;
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      throw new BadRequestException('User not found.');
    }

    // PocketFi wants first/last name separately; our User model only
    // has a single `name` field — split on the first space.
    const [firstName, ...rest] = dbUser.name.trim().split(/\s+/);
    const lastName = rest.join(' ') || firstName;

    const account = await this.pocketfi.createStaticAccount({
      firstName,
      lastName,
      phone,
      email: user.email,
      bank,
    });

    this.logger.log(
      `Created PocketFi ${bank} virtual account ${account.accountNumber} for user ${user.id}`,
    );

    return this.virtualAccountRepo.create({
      userId: user.id,
      bank,
      accountNumber: account.accountNumber,
      accountName: account.accountName,
    });
  }

  /*
  =====================================
      LIST USER'S VIRTUAL ACCOUNTS
  =====================================
  */
  async listVirtualAccounts(userId: string) {
    return this.virtualAccountRepo.findByUser(userId);
  }

  /*
  =====================================
      WEBHOOK (PocketFi)

      *** PROVISIONAL — pending confirmation of the exact field PocketFi
      uses to identify the destination account ***

      PocketFi's published docs sample payload has NO account-number,
      email, or customer field at all:

        { "order": {...}, "transaction": { "reference": "..." } }

      Without that, there is no documented way to know which user's
      wallet a given deposit belongs to. This handler defensively
      checks several plausible field paths a real payload MIGHT
      contain. If none match, it does NOT guess and does NOT credit
      any wallet — it logs the full raw payload loudly (so the real
      shape can be inspected from an actual test deposit) and returns
      200 so PocketFi stops retrying. Crediting the wrong user's
      wallet would be far worse than a delayed/missed credit that
      shows up clearly in the logs for manual reconciliation.

      TODO: once the real field name is confirmed, replace the
      `candidateAccountNumber` lookup below with the correct single
      field access and remove this comment block.
  =====================================
  */
  async webhook(payload: any, signature: string, rawBody: Buffer) {
    if (!signature) {
      throw new BadRequestException('Missing webhook signature.');
    }

    const verified = this.pocketfi.verifyWebhook(rawBody, signature);

    if (!verified) {
      throw new BadRequestException('Invalid webhook signature.');
    }

    const reference: string | undefined =
      payload?.transaction?.reference;

    const amount: number | undefined = payload?.order?.amount;

    if (!reference || !amount) {
      this.logger.warn(
        `PocketFi webhook missing reference/amount. Raw payload: ${JSON.stringify(payload)}`,
      );
      return { message: 'success' };
    }

    // Idempotency — WalletTransaction.reference is unique, so a
    // duplicate delivery of the same event is a safe no-op.
    const existingTx = await this.prisma.walletTransaction.findUnique({
      where: { reference },
    });

    if (existingTx) {
      return { message: 'success' };
    }

    // --- PROVISIONAL account matching (see comment above) ---
    const candidateAccountNumber: string | undefined =
      payload?.account_number ??
      payload?.accountNumber ??
      payload?.order?.account_number ??
      payload?.order?.accountNumber ??
      payload?.transaction?.account_number ??
      payload?.transaction?.accountNumber ??
      payload?.customer?.account_number ??
      payload?.virtual_account?.account_number;

    const virtualAccount = candidateAccountNumber
      ? await this.virtualAccountRepo.findByAccountNumber(
          candidateAccountNumber,
        )
      : null;

    if (!virtualAccount) {
      this.logger.error(
        `PocketFi webhook could NOT be matched to a user — no known account-number field found in the payload. ` +
          `reference=${reference} amount=${amount}. This deposit needs MANUAL reconciliation. Full raw payload:`,
      );
      this.logger.error(JSON.stringify(payload));
      return { message: 'success' };
    }

    try {
      await this.walletService.creditWallet(
        virtualAccount.userId,
        Number(amount),
        `Deposit via PocketFi (${virtualAccount.bank.toUpperCase()} •••${virtualAccount.accountNumber.slice(-4)})`,
        reference,
      );

      this.logger.log(
        `PocketFi webhook processed -> ${reference} (₦${amount}) for user ${virtualAccount.userId}`,
      );
    } catch (err) {
      this.logger.error(
        `PocketFi webhook credit failed for ${reference}: ${(err as Error).message}`,
      );
    }

    return { message: 'success' };
  }
}
