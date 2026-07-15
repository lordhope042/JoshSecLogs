import { Injectable } from '@nestjs/common';
import {
  Prisma,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WalletRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /*
  =====================================
      WALLET
  =====================================
  */

  async findWallet(userId: string) {
    return this.prisma.wallet.findUnique({
      where: {
        userId,
      },
    });
  }

  async createWallet(userId: string) {
    return this.prisma.wallet.create({
      data: {
        userId,
        balance: new Prisma.Decimal(0),
      },
    });
  }

  async getOrCreateWallet(userId: string) {
    let wallet =
      await this.findWallet(userId);

    if (!wallet) {
      wallet =
        await this.createWallet(userId);
    }

    return wallet;
  }

  /*
  =====================================
      CREDIT WALLET
  =====================================
  */

  async creditWallet(
    userId: string,
    amount: number,
  ) {
    return this.prisma.wallet.update({
      where: {
        userId,
      },
      data: {
        balance: {
          increment: amount,
        },
      },
    });
  }

  /*
  =====================================
      DEBIT WALLET
  =====================================
  */

  async debitWallet(
    userId: string,
    amount: number,
  ) {
    return this.prisma.wallet.update({
      where: {
        userId,
      },
      data: {
        balance: {
          decrement: amount,
        },
      },
    });
  }

  /*
  =====================================
      SET BALANCE
  =====================================
  */

  async setBalance(
    userId: string,
    amount: number,
  ) {
    return this.prisma.wallet.update({
      where: {
        userId,
      },
      data: {
        balance: amount,
      },
    });
  }

  /*
  =====================================
      CREATE TRANSACTION
  =====================================
  */

  async createTransaction(data: {
    userId: string;

    type: TransactionType;

    status: TransactionStatus;

    amount: number;

    balanceBefore?: number;

    balanceAfter?: number;

    description: string;

    reference: string;

    metadata?: Prisma.InputJsonValue;
  }) {
    return this.prisma.walletTransaction.create({
      data,
    });
  }

  /*
  =====================================
      UPDATE TRANSACTION
  =====================================
  */

  async updateTransaction(
    reference: string,
    data: {
      status?: TransactionStatus;
      balanceBefore?: number;
      balanceAfter?: number;
      metadata?: Prisma.InputJsonValue;
    },
  ) {
    return this.prisma.walletTransaction.update({
      where: {
        reference,
      },
      data,
    });
  }

  /*
  =====================================
      FIND TRANSACTION
  =====================================
  */

  async findTransaction(
    reference: string,
  ) {
    return this.prisma.walletTransaction.findUnique({
      where: {
        reference,
      },
    });
  }

  /*
  =====================================
      USER TRANSACTIONS
  =====================================
  */

  async transactions(
    userId: string,
  ) {
    return this.prisma.walletTransaction.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /*
  =====================================
      WALLET SUMMARY
  =====================================
  */

  async summary(userId: string) {
    const wallet =
      await this.getOrCreateWallet(userId);

    const transactions =
      await this.prisma.walletTransaction.count({
        where: {
          userId,
        },
      });

    return {
      balance: wallet.balance,
      transactionCount: transactions,
      updatedAt: wallet.updatedAt,
    };
  }
}