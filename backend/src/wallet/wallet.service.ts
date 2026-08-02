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
import { TxClient, WalletRepository } from './wallet.repository';

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

      FIX: an optional `tx` (transactional Prisma client) can now be passed
      in by callers that are already inside a `prisma.$transaction(tx => …)`.
      When `tx` is provided, EVERY operation below — the wallet read, the
      balance increment, the re-read, and the WalletTransaction insert — runs
      on `tx`, so they commit or roll back together with the caller's
      transaction.  This is what makes Paystack deposits atomic.

      When `tx` is omitted (the marketplace, manual top-ups, etc.), behaviour
      is unchanged — everything runs on the shared `this.prisma` client.
  =====================================
  */

  async creditWallet(
    userId: string,
    amount: number,
    description = 'Wallet credit',
    reference?: string,
    tx?: TxClient,
  ) {
    if (amount <= 0) {
      throw new BadRequestException('Invalid credit amount');
    }

    // Read the CURRENT balance on the same client as the increment so the
    // balanceBefore / balanceAfter ledger values are consistent with what
    // actually gets committed.
    const wallet = await this.walletRepo.getOrCreateWallet(userId, tx);
    const before = Number(wallet.balance);

    // Atomic SQL increment.  When `tx` is supplied this UPDATE is part of the
    // caller's transaction and holds the row lock until commit.
    await this.walletRepo.creditWallet(userId, amount, tx);

    // Re-read on the same client to capture the post-increment balance for
    // the ledger row.
    const updated = await this.walletRepo.findWallet(userId, tx);

    await this.walletRepo.createTransaction(
      {
        userId,
        type: TransactionType.CREDIT,
        status: TransactionStatus.SUCCESS,
        amount,
        balanceBefore: before,
        balanceAfter: Number(updated!.balance),
        description,
        reference: reference ?? randomUUID(),
      },
      tx,
    );

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
      - also now transaction-aware via the optional `tx` argument.
  =====================================
  */

  async debitWallet(
    userId: string,
    amount: number,
    description = 'Wallet debit',
    reference?: string,
    tx?: TxClient,
  ) {
    const wallet = await this.walletRepo.getOrCreateWallet(userId, tx);
    const balance = Number(wallet.balance);

    if (balance < amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    await this.walletRepo.debitWallet(userId, amount, tx);

    const updated = await this.walletRepo.findWallet(userId, tx);

    await this.walletRepo.createTransaction(
      {
        userId,
        type: TransactionType.DEBIT,
        status: TransactionStatus.SUCCESS,
        amount,
        balanceBefore: balance,
        balanceAfter: Number(updated!.balance),
        description,
        reference: reference ?? randomUUID(),
      },
      tx,
    );

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
