import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  TransactionStatus,
  TransactionType,
} from '@prisma/client';

import { randomUUID } from 'crypto';
import { WalletRepository } from './wallet.repository';

@Injectable()
export class WalletService {
  constructor(private readonly walletRepo: WalletRepository) {}

  /*
  =====================================
      WALLET BALANCE
  =====================================
  */

  async balance(userId: string) {
    return this.walletRepo.getOrCreateWallet(userId);
  }

  /*
  =====================================
      DEPOSIT / CREDIT WALLET
      (PRIMARY METHOD)
  =====================================
  */

  async creditWallet(
    userId: string,
    amount: number,
    description = 'Wallet credit',
    reference?: string,
  ) {
    if (amount <= 0) {
      throw new BadRequestException('Invalid credit amount');
    }

    const wallet = await this.walletRepo.getOrCreateWallet(userId);
    const before = Number(wallet.balance);

    await this.walletRepo.creditWallet(userId, amount);

    const updated = await this.walletRepo.findWallet(userId);

    await this.walletRepo.createTransaction({
      userId,
      type: TransactionType.CREDIT,
      status: TransactionStatus.SUCCESS,
      amount,
      balanceBefore: before,
      balanceAfter: Number(updated!.balance),
      description,
      reference: reference ?? randomUUID(),
    });

    return updated;
  }

  /*
  =====================================
      ALIAS (FIXES YOUR MARKETPLACE ERROR)
      - marketplace.service.ts uses "credit"
  =====================================
  */

  async credit(
    userId: string,
    amount: number,
    description = 'Wallet credit',
  ) {
    return this.creditWallet(userId, amount, description);
  }

  /*
  =====================================
      DEBIT WALLET
  =====================================
  */

  async debitWallet(
    userId: string,
    amount: number,
    description = 'Wallet debit',
  ) {
    const wallet = await this.walletRepo.getOrCreateWallet(userId);
    const balance = Number(wallet.balance);

    if (balance < amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    await this.walletRepo.debitWallet(userId, amount);

    const updated = await this.walletRepo.findWallet(userId);

    await this.walletRepo.createTransaction({
      userId,
      type: TransactionType.DEBIT,
      status: TransactionStatus.SUCCESS,
      amount,
      balanceBefore: balance,
      balanceAfter: Number(updated!.balance),
      description,
      reference: randomUUID(),
    });

    return updated;
  }

  /*
  =====================================
      VERIFY DEPOSIT (IDEMPOTENT)
      - prevents double crediting
      - safe for Paystack webhook + manual verify
  =====================================
  */

  async verifyDeposit(
    userId: string,
    reference: string,
    amount: number,
  ) {
    const existing =
      await this.walletRepo.findTransaction(reference);

    if (existing) {
      return {
        success: true,
        alreadyProcessed: true,
        balance: Number(
          (await this.walletRepo.findWallet(userId))!.balance,
        ),
      };
    }

    return this.creditWallet(
      userId,
      amount,
      'Deposit via Paystack',
      reference,
    );
  }

  /*
  =====================================
      SUMMARY
  =====================================
  */

  async summary(userId: string) {
    return this.walletRepo.summary(userId);
  }

  /*
  =====================================
      TRANSACTIONS
  =====================================
  */

  async transactions(userId: string) {
    return this.walletRepo.transactions(userId);
  }

  async transaction(userId: string, reference: string) {
    const tx = await this.walletRepo.findTransaction(reference);

    if (!tx || tx.userId !== userId) {
      throw new NotFoundException('Transaction not found');
    }

    return tx;
  }
}