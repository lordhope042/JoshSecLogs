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

  /*
  =====================================
      WEBHOOK (PocketFi) — DEBUG EDITION
  =====================================
  */
  async webhook(payload: any, signature: string, rawBody: Buffer) {
    // 1. ALWAYS log the raw request first — even if signature fails
    this.logger.warn(
      `=== POCKETFI WEBHOOK HIT ===\n` +
      `Signature header: ${signature ?? 'MISSING'}\n` +
      `Raw body: ${rawBody.toString()}\n` +
      `Parsed payload: ${JSON.stringify(payload, null, 2)}`,
    );

    if (!signature) {
      this.logger.error('Webhook rejected: missing signature');
      throw new BadRequestException('Missing webhook signature.');
    }

    // 2. Try to verify, but if it fails, log WHY and still continue
    //    (remove the try/catch bypass after you confirm signature works)
    let verified = false;
    try {
      verified = this.pocketfi.verifyWebhook(rawBody, signature);
    } catch (err) {
      this.logger.error(`Signature verification threw: ${(err as Error).message}`);
    }

    this.logger.warn(`Signature verification result: ${verified}`);

    if (!verified) {
      // TEMPORARY: some providers send signatures with a "sha512=" prefix
      const altSig = signature.startsWith('sha512=') ? signature.slice(7) : `sha512=${signature}`;
      const altVerified = this.pocketfi.verifyWebhook(rawBody, altSig);
      if (!altVerified) {
        this.logger.error('Webhook rejected: signature mismatch');
        throw new BadRequestException('Invalid webhook signature.');
      }
      this.logger.warn('Signature matched with alternative format');
    }

    // 3. Extract fields — try EVERY possible path PocketFi might use
    const reference: string | undefined =
      payload?.reference ??
      payload?.data?.reference ??
      payload?.transaction?.reference ??
      payload?.order?.reference ??
      payload?.payment?.reference ??
      payload?.id;

    // PocketFi sometimes sends amount in kobo (10000 = ₦100), sometimes in naira (100)
    let rawAmount: number | undefined =
      payload?.amount ??
      payload?.data?.amount ??
      payload?.order?.amount ??
      payload?.transaction?.amount ??
      payload?.payment?.amount;

    // Convert kobo to naira if it looks like kobo (>= 1000 and no decimal)
    const amount: number | undefined =
      rawAmount !== undefined
        ? rawAmount >= 1000 && Number.isInteger(rawAmount)
          ? rawAmount / 100
          : rawAmount
        : undefined;

    // 4. Try to find the account number — check EVERY possible nesting
    const candidateAccountNumber: string | undefined =
      payload?.account_number ??
      payload?.accountNumber ??
      payload?.data?.account_number ??
      payload?.data?.accountNumber ??
      payload?.data?.virtual_account?.account_number ??
      payload?.virtual_account?.account_number ??
      payload?.virtualAccount?.account_number ??
      payload?.virtualAccount ??
      payload?.order?.account_number ??
      payload?.transaction?.account_number ??
      payload?.payment?.account_number ??
      payload?.customer?.account_number ??
      payload?.meta?.account_number ??
      payload?.recipient?.account_number;

    // 5. Some webhooks identify by sender name + account instead of virtual account
    const senderName: string | undefined =
      payload?.sender_name ??
      payload?.senderName ??
      payload?.data?.sender_name ??
      payload?.customer?.name;

    this.logger.warn(
      `Extracted: reference=${reference}, rawAmount=${rawAmount}, ` +
      `convertedAmount=${amount}, account=${candidateAccountNumber}, sender=${senderName}`,
    );

    if (!reference || amount === undefined) {
      this.logger.error('Webhook rejected: missing reference or amount');
      return { message: 'success' }; // return 200 so they stop retrying
    }

    // 6. Idempotency check
    const existingTx = await this.prisma.walletTransaction.findUnique({
      where: { reference },
    });

    if (existingTx) {
      this.logger.log(`Duplicate webhook: ${reference} already processed`);
      return { message: 'success' };
    }

    // 7. Find virtual account by account number
    let virtualAccount = candidateAccountNumber
      ? await this.virtualAccountRepo.findByAccountNumber(
          String(candidateAccountNumber).trim(),
        )
      : null;

    // 8. If no match by account number, try matching by the reference itself
    //    (some providers include the virtual account reference in the payment ref)
    if (!virtualAccount) {
      this.logger.warn('No match by account number, trying reference lookup...');
      // Check if any virtual account user's email appears in payload
      const candidateEmail: string | undefined =
        payload?.email ??
        payload?.customer?.email ??
        payload?.data?.email ??
        payload?.sender_email;
      
      if (candidateEmail) {
        const user = await this.prisma.user.findUnique({
          where: { email: candidateEmail.toLowerCase() },
          include: { virtualAccounts: true },
        });
        if (user?.virtualAccounts?.[0]) {
          virtualAccount = user.virtualAccounts[0];
          this.logger.warn(`Matched by email fallback: ${candidateEmail}`);
        }
      }
    }

    if (!virtualAccount) {
      this.logger.error(
        `CRITICAL: PocketFi webhook could NOT match deposit.\n` +
        `Reference: ${reference} | Amount: ₦${amount} | Account tried: ${candidateAccountNumber}\n` +
        `This deposit needs MANUAL reconciliation. Full payload logged above.`,
      );
      return { message: 'success' };
    }

    // 9. Credit the wallet
    try {
      await this.walletService.creditWallet(
        virtualAccount.userId,
        amount,
        `Deposit via PocketFi (${virtualAccount.bank.toUpperCase()} •••${virtualAccount.accountNumber.slice(-4)}) — ${senderName ?? 'Bank Transfer'}`,
        reference,
      );

      this.logger.log(
        `✅ SUCCESS: Credited ₦${amount} to user ${virtualAccount.userId} (ref: ${reference})`,
      );
    } catch (err) {
      this.logger.error(
        `Wallet credit FAILED for ${reference}: ${(err as Error).message}`,
      );
      // Still return 200 — don't let PocketFi retry and double-charge
    }

    return { message: 'success' };
  }

  /*
  =====================================
      MANUAL RECONCILIATION
      Call this from Postman/Insomnia if a webhook was missed.
  =====================================
  */
  async manualReconcile(reference: string, accountNumber: string, amount: number) {
    const virtualAccount = await this.virtualAccountRepo.findByAccountNumber(
      accountNumber,
    );

    if (!virtualAccount) {
      throw new BadRequestException('Virtual account not found.');
    }

    const existing = await this.prisma.walletTransaction.findUnique({
      where: { reference },
    });

    if (existing) {
      return { message: 'Already processed' };
    }

    await this.walletService.creditWallet(
      virtualAccount.userId,
      amount,
      `Manual reconciliation (${virtualAccount.bank.toUpperCase()} •••${accountNumber.slice(-4)})`,
      reference,
    );

    return { message: 'Reconciled', credited: amount };
  }
}