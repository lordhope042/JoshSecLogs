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

  async getOrCreateVirtualAccount(
    user: { id: string; email: string },
    bank: PocketFiBank,
    phone: string,
  ) {
    const existing = await this.virtualAccountRepo.findByUserAndBank(
      user.id,
      bank,
    );
    if (existing) return existing;

    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
    });
    if (!dbUser) throw new BadRequestException('User not found.');

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

  async listVirtualAccounts(userId: string) {
    return this.virtualAccountRepo.findByUser(userId);
  }

  /*
  =====================================
      WEBHOOK — POCKETFI

      Confirmed payload shape from logs:
      {
        "order": {
          "amount": 100,
          "settlement_amount": 99.1,
          "fee": 0.9,
          "description": "..."
        },
        "transaction": { "reference": "PFI|..." },
        "account_number": "7005000264",
        "customer": { "email": "...", ... }
      }
  =====================================
  */
  async webhook(payload: any, signature: string, rawBody: Buffer) {
    // --- 1. Log everything first ---
    this.logger.warn(
      `=== POCKETFI WEBHOOK ===\n` +
        `Signature: ${signature ?? 'MISSING'}\n` +
        `Body: ${rawBody.toString()}`,
    );

    // --- 2. Signature check (with emergency bypass) ---
    let verified = false;
    try {
      verified = this.pocketfi.verifyWebhook(rawBody, signature);
    } catch (err) {
      this.logger.error(`Signature check error: ${(err as Error).message}`);
    }

    // EMERGENCY BYPASS: if you set POCKETFI_WEBHOOK_SECRET=skip_verification
    // in Railway/Render env vars, it will process the payment anyway.
    // REMOVE THIS once signature verification is working.
    const skipVerification =
      process.env.POCKETFI_WEBHOOK_SECRET === 'skip_verification';

    if (!verified && !skipVerification) {
      this.logger.error('Webhook rejected: invalid signature');
      throw new BadRequestException('Invalid webhook signature.');
    }

    if (skipVerification) {
      this.logger.warn('⚠️  WEBHOOK SIGNATURE VERIFICATION IS DISABLED');
    }

    // --- 3. Extract confirmed fields ---
    const reference: string | undefined =
      payload?.transaction?.reference ?? payload?.reference;

    // Use settlement_amount (what actually arrives) if available,
    // otherwise fall back to gross amount.
    const amount: number | undefined =
      payload?.order?.settlement_amount ?? payload?.order?.amount;

    const accountNumber: string | undefined = payload?.account_number;
    const customerEmail: string | undefined = payload?.customer?.email;

    this.logger.warn(
      `Parsed: ref=${reference}, amount=${amount}, account=${accountNumber}, email=${customerEmail}`,
    );

    if (!reference || amount === undefined) {
      this.logger.error('Missing reference or amount');
      return { message: 'success' };
    }

    // --- 4. Idempotency ---
    const existing = await this.prisma.walletTransaction.findUnique({
      where: { reference },
    });
    if (existing) {
      this.logger.log(`Duplicate webhook: ${reference}`);
      return { message: 'success' };
    }

    // --- 5. Find virtual account ---
    let virtualAccount = accountNumber
      ? await this.virtualAccountRepo.findByAccountNumber(
          String(accountNumber).trim(),
        )
      : null;

    // Fallback: match by customer email if account number lookup fails
    if (!virtualAccount && customerEmail) {
      const user = await this.prisma.user.findUnique({
        where: { email: customerEmail.toLowerCase() },
        include: { virtualAccounts: true },
      });
      if (user?.virtualAccounts?.[0]) {
        virtualAccount = user.virtualAccounts[0];
        this.logger.warn(`Matched by email fallback: ${customerEmail}`);
      }
    }

    if (!virtualAccount) {
      this.logger.error(
        `NO MATCH: ref=${reference}, account=${accountNumber}, email=${customerEmail}. Needs manual reconciliation.`,
      );
      return { message: 'success' };
    }

    // --- 6. Credit wallet ---
    try {
      await this.walletService.creditWallet(
        virtualAccount.userId,
        Number(amount),
        `Deposit via PocketFi (${virtualAccount.bank.toUpperCase()} •••${virtualAccount.accountNumber.slice(-4)})`,
        reference,
      );
      this.logger.log(
        `✅ Credited ₦${amount} to user ${virtualAccount.userId} (ref: ${reference})`,
      );
    } catch (err) {
      this.logger.error(
        `Credit failed for ${reference}: ${(err as Error).message}`,
      );
    }

    return { message: 'success' };
  }

  /*
  =====================================
      MANUAL RECONCILIATION
      For missed deposits while debugging.
  =====================================
  */
  async manualReconcile(
    reference: string,
    accountNumber: string,
    amount: number,
  ) {
    const virtualAccount = await this.virtualAccountRepo.findByAccountNumber(
      accountNumber,
    );
    if (!virtualAccount) {
      throw new BadRequestException('Virtual account not found.');
    }

    const existing = await this.prisma.walletTransaction.findUnique({
      where: { reference },
    });
    if (existing) return { message: 'Already processed' };

    await this.walletService.creditWallet(
      virtualAccount.userId,
      amount,
      `Manual reconciliation (${virtualAccount.bank.toUpperCase()} •••${accountNumber.slice(-4)})`,
      reference,
    );

    return { message: 'Reconciled', credited: amount };
  }
}