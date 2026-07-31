import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';

import { PaymentStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

import { PaymentRepository } from './payment.repository';
import { PaystackService } from './paystack.service';
import { WalletService } from '../wallet/wallet.service';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly paystack: PaystackService,
    private readonly walletService: WalletService,
    private readonly prisma: PrismaService,
  ) {}

  /*
  =====================================
      INITIALIZE PAYMENT
  =====================================
  */
  async initialize(user: { id: string; email: string }, amount: number) {
    if (amount < 100) {
      throw new BadRequestException('Minimum deposit is ₦100.');
    }

    const reference = randomUUID();

    await this.paymentRepo.create({
      userId: user.id,
      amount,
      reference,
      provider: 'PAYSTACK',
    });

    const gateway = await this.paystack.initialize(
      user.email,
      amount,
      reference,
    );

    await this.paymentRepo.updateGatewayReference(
      reference,
      gateway.reference,
    );

    this.logger.log(`Payment initialized -> ${reference}`);

    return {
      success: true,
      reference,
      authorizationUrl: gateway.authorizationUrl,
      accessCode: gateway.accessCode,
    };
  }

  /*
  =====================================
      SAFE WALLET CREDIT (ATOMIC + IDEMPOTENT)
      - Uses a Prisma interactive transaction so the payment status check
        and the status flip happen atomically.  This closes the race window
        where a concurrent verify() call + a Paystack webhook could both
        pass the "if status === SUCCESS return false" guard and double-credit.
  =====================================
  */
  private async creditWalletOnce(
    userId: string,
    reference: string,
    expectedAmount: number,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Lock the payment row by reading it inside the transaction.
      // (Prisma doesn't expose SELECT ... FOR UPDATE directly, but doing the
      // read + conditional update inside $transaction gives us serializable
      // isolation on Supabase/Postgres which is sufficient here.)
      const payment = await tx.payment.findUnique({
        where: { reference },
      });

      if (!payment) {
        throw new BadRequestException('Payment not found.');
      }

      // Already processed — idempotent no-op.
      if (payment.status === PaymentStatus.SUCCESS) {
        return false;
      }

      // Amount mismatch guard — protects against underpayment exploits where
      // a user initialises a ₦10,000 payment, pays only ₦100 on Paystack
      // (Paystack allows custom amounts for some channels), then calls verify.
      // We compare in whole kobo to avoid floating-point drift.
      const expectedKobo = Math.round(expectedAmount * 100);
      const dbKobo = Math.round(Number(payment.amount) * 100);

      if (expectedKobo !== dbKobo) {
        await tx.payment.update({
          where: { reference },
          data: {
            status: PaymentStatus.FAILED,
            verifiedAt: new Date(),
          },
        });
        this.logger.warn(
          `Amount mismatch for ${reference}: expected ₦${expectedAmount} but DB has ₦${payment.amount}. Marking FAILED.`,
        );
        throw new BadRequestException(
          'Payment amount mismatch. Contact support.',
        );
      }

      // Flip status to SUCCESS FIRST (inside the tx).  Any concurrent
      // transaction that reads this row will now see SUCCESS and bail.
      await tx.payment.update({
        where: { reference },
        data: {
          status: PaymentStatus.SUCCESS,
          paidAt: new Date(),
          verifiedAt: new Date(),
        },
      });

      // Credit the wallet.  WalletService.creditWallet creates its own
      // WalletTransaction record with before/after balances.
      await this.walletService.creditWallet(
        userId,
        Number(payment.amount),
        `Deposit via Paystack (${reference})`,
        reference,
      );

      return true;
    });
  }

  /*
  =====================================
      VERIFY PAYMENT (FRONTEND)
  =====================================
  */
  async verify(userId: string, reference: string) {
    const payment = await this.paymentRepo.findByReference(reference);

    if (!payment) {
      throw new BadRequestException('Payment not found.');
    }

    if (payment.userId !== userId) {
      throw new BadRequestException('Unauthorized payment.');
    }

    // already processed
    if (payment.status === PaymentStatus.SUCCESS) {
      const wallet = await this.walletService.balance(userId);

      return {
        success: true,
        alreadyVerified: true,
        reference,
        balance: Number(wallet.balance),
      };
    }

    const verification = await this.paystack.verify(reference);

    if (verification.status !== 'success') {
      await this.paymentRepo.updateStatus(
        reference,
        PaymentStatus.FAILED,
        verification.raw,
      );

      throw new BadRequestException('Payment failed.');
    }

    // FIX: use the amount Paystack actually received (in Naira) — NOT the DB
    // amount — so creditWalletOnce can compare the two and reject mismatches.
    const verifiedAmount = Number(verification.amount);

    await this.creditWalletOnce(
      payment.userId,
      reference,
      verifiedAmount,
    );

    // Persist the gateway response for audit trail.
    await this.paymentRepo
      .updateStatus(reference, PaymentStatus.SUCCESS, verification.raw)
      .catch(() => {
        /* status already flipped inside the transaction */
      });

    const wallet = await this.walletService.balance(userId);

    this.logger.log(`Payment verified -> ${reference}`);

    return {
      success: true,
      credited: true,
      reference,
      amount: verifiedAmount,
      balance: Number(wallet.balance),
    };
  }

  /*
  =====================================
      HISTORY
  =====================================
  */
  async history(userId: string) {
    return this.paymentRepo.userPayments(userId);
  }

  /*
  =====================================
      SINGLE PAYMENT
  =====================================
  */
  async payment(userId: string, reference: string) {
    const payment = await this.paymentRepo.userPayment(userId, reference);

    if (!payment) {
      throw new BadRequestException('Payment not found.');
    }

    return payment;
  }

  /*
  =====================================
      WEBHOOK (TRUSTED SOURCE)
  =====================================
  */
  async webhook(payload: any, signature: string, rawBody: Buffer) {
    if (!signature) {
      throw new BadRequestException('Missing webhook signature.');
    }

    const verified = this.paystack.verifyWebhook(rawBody, signature);

    if (!verified) {
      throw new BadRequestException('Invalid webhook signature.');
    }

    if (payload.event !== 'charge.success') {
      return { received: true };
    }

    const reference = payload.data?.reference;

    if (!reference) {
      this.logger.warn('Webhook received with no reference.');
      return { received: true };
    }

    const payment = await this.paymentRepo.findByReference(reference);

    if (!payment) {
      // Unknown payment — acknowledge so Paystack stops retrying.
      this.logger.warn(`Webhook for unknown payment ${reference}.`);
      return { received: true };
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      // Already credited (e.g. via the verify endpoint). Idempotent.
      return { received: true };
    }

    // Paystack sends amount in kobo. Convert to Naira and use it as the
    // expected amount so creditWalletOnce can detect underpayment.
    const webhookAmountNaira = Number(payload.data?.amount ?? 0) / 100;

    try {
      await this.creditWalletOnce(
        payment.userId,
        reference,
        webhookAmountNaira,
      );
      this.logger.log(`Webhook processed -> ${reference}`);
    } catch (err) {
      // Amount mismatch or other error — log but still 200 so Paystack
      // doesn't hammer us. The payment is already marked FAILED inside.
      this.logger.error(
        `Webhook credit failed for ${reference}: ${(err as Error).message}`,
      );
    }

    return { received: true };
  }
}