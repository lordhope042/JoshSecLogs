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

    if (existing) {
      return existing;
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      throw new BadRequestException('User not found.');
    }

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

  async webhook(payload: any, signature: string, rawBody: Buffer) {
    if (!signature) {
      throw new BadRequestException('Missing webhook signature.');
    }

    const verified = this.pocketfi.verifyWebhook(rawBody, signature);
    if (!verified) {
      throw new BadRequestException('Invalid webhook signature.');
    }

    // --- DEBUG: Log the full payload so you can see the real shape ---
    this.logger.warn(
      `POCKETFI WEBHOOK DEBUG — Full payload:\n${JSON.stringify(payload, null, 2)}`,
    );

    const reference: string | undefined =
      payload?.transaction?.reference ??
      payload?.reference ??
      payload?.data?.reference;

    const amount: number | undefined =
      payload?.order?.amount ??
      payload?.amount ??
      payload?.data?.amount;

    // Try EVERY possible field name for account number / identifier
    const candidateAccountNumber: string | undefined =
      payload?.account_number ??
      payload?.accountNumber ??
      payload?.data?.account_number ??
      payload?.data?.accountNumber ??
      payload?.virtual_account?.account_number ??
      payload?.virtualAccount ??
      payload?.order?.account_number ??
      payload?.transaction?.account_number ??
      payload?.customer?.account_number ??
      payload?.meta?.account_number;

    // Also log email / customer fields in case they identify by email instead
    const candidateEmail: string | undefined =
      payload?.email ??
      payload?.customer?.email ??
      payload?.data?.email ??
      payload?.order?.email;

    this.logger.warn(
      `POCKETFI WEBHOOK DEBUG — extracted: reference=${reference}, amount=${amount}, account=${candidateAccountNumber}, email=${candidateEmail}`,
    );

    if (!reference || !amount) {
      return { message: 'success' };
    }

    // Idempotency check
    const existingTx = await this.prisma.walletTransaction.findUnique({
      where: { reference },
    });
    if (existingTx) {
      return { message: 'success' };
    }

    // Try to find account by account number
    let virtualAccount = candidateAccountNumber
      ? await this.virtualAccountRepo.findByAccountNumber(candidateAccountNumber)
      : null;

    // FALLBACK: if no account number found, try matching by email
    if (!virtualAccount && candidateEmail) {
      const user = await this.prisma.user.findUnique({
        where: { email: candidateEmail },
        include: { virtualAccounts: true },
      });
      if (user?.virtualAccounts?.[0]) {
        virtualAccount = user.virtualAccounts[0];
        this.logger.warn(
          `POCKETFI WEBHOOK DEBUG — matched by email fallback: ${candidateEmail}`,
        );
      }
    }

    if (!virtualAccount) {
      this.logger.error(
        `PocketFi webhook: NO MATCH for reference=${reference}. Check logs above for payload shape. Needs manual reconciliation.`,
      );
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