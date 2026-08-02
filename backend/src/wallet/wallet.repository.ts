import { Injectable } from '@nestjs/common';
import {
  Prisma,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

/*
 * The "tx client" type.
 *
 * `Prisma.TransactionClient` is the EXACT type of the `tx` argument that
 * Prisma hands to the `prisma.$transaction(async (tx) => …)` callback.  It
 * is `Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$use' |
 * '$extends'>` — i.e. a PrismaClient with the connection-management methods
 * stripped off, but with every model delegate (wallet, walletTransaction,
 * payment, …) intact.
 *
 * `PrismaService extends PrismaClient`, so a PrismaService instance is
 * assignable to `Prisma.TransactionClient` (it has a superset of the
 * required properties).  That means the SAME type accepts both:
 *   - the transactional `tx` passed in from payments.service.ts
 *   - the shared `this.prisma` PrismaService used as the default
 *
 * This lets every repository method run inside OR outside a transaction
 * without any cast, which is what makes the Paystack deposit fix work:
 * the wallet UPDATE + ledger INSERT run on the caller's `tx`.
 */
export type TxClient = Prisma.TransactionClient;

@Injectable()
export class WalletRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /*
  =====================================
      resolve client helper
      - if the caller passed a `tx` (from inside a $transaction), use it
      - otherwise fall back to the shared `this.prisma`
      This is the single line that fixes the deposit bug: every method now
      runs on the SAME connection as the caller's transaction.
  =====================================
  */
  private client(tx?: TxClient): TxClient {
    return tx ?? this.prisma;
  }

  /*
  =====================================
      WALLET
  =====================================
  */

  async findWallet(userId: string, tx?: TxClient) {
    return this.client(tx).wallet.findUnique({
      where: {
        userId,
      },
    });
  }

  async createWallet(userId: string, tx?: TxClient) {
    return this.client(tx).wallet.create({
      data: {
        userId,
        balance: new Prisma.Decimal(0),
      },
    });
  }

  async getOrCreateWallet(userId: string, tx?: TxClient) {
    let wallet =
      await this.findWallet(userId, tx);

    if (!wallet) {
      wallet =
        await this.createWallet(userId, tx);
    }

    return wallet;
  }

  /*
  =====================================
      CREDIT WALLET
      - atomic SQL `UPDATE … SET balance = balance + amount`
      - runs on `tx` when provided, so it participates in the caller's
        transaction (and its row locks).
  =====================================
  */

  async creditWallet(
    userId: string,
    amount: number,
    tx?: TxClient,
  ) {
    return this.client(tx).wallet.update({
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
    tx?: TxClient,
  ) {
    return this.client(tx).wallet.update({
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
    tx?: TxClient,
  ) {
    return this.client(tx).wallet.update({
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
  }, tx?: TxClient) {
    return this.client(tx).walletTransaction.create({
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
    tx?: TxClient,
  ) {
    return this.client(tx).walletTransaction.update({
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
    tx?: TxClient,
  ) {
    return this.client(tx).walletTransaction.findUnique({
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

  /*
  =====================================
      USER TRANSACTIONS  (PAGINATED)

      FIX: server-side pagination.  Previously this returned EVERY row for
      the user with no LIMIT — fine for a handful of transactions but it
      becomes a real problem (memory + latency + payload size) once a user
      has thousands of ledger entries.  Now callers can pass `page` (1-based)
      and `limit`; we apply Prisma `take`/`skip` and also run a `count` so
      the caller can render page controls.

      When `page`/`limit` are omitted (e.g. the /wallet/refresh endpoint and
      WalletService.summary) we fall back to the legacy behaviour of
      returning everything, so existing callers are unaffected.
  =====================================
  */

  async transactions(
    userId: string,
    page?: number,
    limit?: number,
    tx?: TxClient,
  ) {
    const client = this.client(tx);

    // No pagination requested → return the full set (back-compat).
    if (page === undefined || limit === undefined) {
      return {
        data: await client.walletTransaction.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        }),
        total: await client.walletTransaction.count({
          where: { userId },
        }),
      };
    }

    // Clamp inputs to safe, sane values.
    const safePage = Math.max(1, Math.floor(page) || 1);
    const safeLimit = Math.min(
      100,
      Math.max(1, Math.floor(limit) || 20),
    );

    const [data, total] = await Promise.all([
      client.walletTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: safeLimit,
        skip: (safePage - 1) * safeLimit,
      }),
      client.walletTransaction.count({
        where: { userId },
      }),
    ]);

    return { data, total };
  }

  /*
  =====================================
      WALLET SUMMARY
  =====================================
  */

  async summary(userId: string, tx?: TxClient) {
    const wallet =
      await this.getOrCreateWallet(userId, tx);

    const transactions =
      await this.client(tx).walletTransaction.count({
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
