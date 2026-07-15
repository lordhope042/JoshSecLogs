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

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly paystack: PaystackService,
    private readonly walletService: WalletService,
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
      SAFE WALLET CREDIT (IDEMPOTENT)
  =====================================
  */
  private async creditWalletOnce(
    userId: string,
    reference: string,
    amount: number,
  ) {
    const payment = await this.paymentRepo.findByReference(reference);

    if (!payment) {
      throw new BadRequestException('Payment not found.');
    }

    // prevent double credit
    if (payment.status === PaymentStatus.SUCCESS) {
      return false;
    }

    await this.walletService.creditWallet(userId, amount);

    await this.paymentRepo.updateStatus(
      reference,
      PaymentStatus.SUCCESS,
      {},
    );

    return true;
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

    // FIX: Decimal → number conversion
    const amount = Number(payment.amount);

    await this.creditWalletOnce(payment.userId, reference, amount);

    const wallet = await this.walletService.balance(userId);

    this.logger.log(`Payment verified -> ${reference}`);

    return {
      success: true,
      credited: true,
      reference,
      amount,
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
    const verified = this.paystack.verifyWebhook(rawBody, signature);

    if (!verified) {
      throw new BadRequestException('Invalid webhook signature.');
    }

    if (payload.event !== 'charge.success') {
      return { received: true };
    }

    const reference = payload.data.reference;

    const payment = await this.paymentRepo.findByReference(reference);

    if (!payment) {
      return { received: true };
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      return { received: true };
    }

    // FIX: Decimal → number conversion
    const amount = Number(payment.amount);

    await this.creditWalletOnce(payment.userId, reference, amount);

    this.logger.log(`Webhook processed -> ${reference}`);

    return { received: true };
  }
}