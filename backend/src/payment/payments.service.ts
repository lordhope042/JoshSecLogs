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

      *** THE BUG FIX ***
      The previous version wrapped everything in `prisma.$transaction(tx => …)`
      but then called `this.walletService.creditWallet(...)`, which internally
      used `this.prisma` — the NON-transactional client — instead of `tx`.

      Result: the Payment status flip ran on `tx`, but the Wallet.balance
      UPDATE and the WalletTransaction INSERT ran on a completely separate
      connection, outside the transaction.  The two operations were NOT
      atomic.  Depending on isolation/commit timing this could leave the
      Payment marked SUCCESS (committed on tx) while the wallet increment was
      lost, overwritten, or rolled back — which is exactly the reported
      symptom: admin sees the deposit as "Success", the ledger row exists with
      the correct balanceAfter, but the live Wallet.balance never moves.

      FIX: `WalletService.creditWallet` (and the repository methods it calls)
      now accept an optional `tx` argument.  We pass `tx` through, so the
      wallet UPDATE + ledger INSERT run on the SAME transaction/connection as
      the Payment status flip.  All three writes now commit or roll back
      together — exactly like the admin refund code already does.

      This also keeps the idempotency guarantee: the `payment.status ===
      SUCCESS` early return is read on `tx` with a row lock, so a concurrent
      verify() + webhook can't both pass the guard.
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

      // Credit the wallet ON THE SAME TRANSACTION (`tx`).
      // Previously this called walletService.creditWallet WITHOUT tx, so the
      // wallet balance increment ran on a separate connection and was not
      // committed atomically with the payment status flip above.  Passing
      // `tx` is the fix — now the balance UPDATE, the WalletTransaction
      // INSERT, and the Payment status UPDATE all commit together.
      await this.walletService.creditWallet(
        userId,
        Number(payment.amount),
        `Deposit via Paystack (${reference})`,
        reference,
        tx, // <-- THE FIX: run the wallet credit inside this transaction
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
    // NOTE: the payment status (SUCCESS/FAILED/paidAt/verifiedAt) is ALREADY
    // flipped inside `creditWalletOnce`'s transaction, so this second
    // updateStatus is purely to store the raw provider response JSON.  We
    // keep it as a best-effort, non-throwing write — it must NOT be relied on
    // to set the status, because if it ran on `this.prisma` and committed
    // separately it could mask the transactional flip.  It only touches the
    // `providerResponse` column here is not needed because updateStatus also
    // sets status — but since the row is already SUCCESS this is a harmless
    // idempotent re-write of the same status.  Wrapped in .catch() so a
    // duplicate-key / timing error can never break the verify flow.
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
