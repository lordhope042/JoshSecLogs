import { Injectable } from "@nestjs/common";

import {
  Prisma,
  PaymentStatus,
  SocialLogStatus,
  Order,
  WalletTransaction,
  User,
  Wallet,
} from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

type OrderWithUserWallet = Order & {
  user: User & { wallet: Wallet | null };
};

type TransactionWithUserWallet = WalletTransaction & {
  user: User & { wallet: Wallet | null };
};

@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  /*
  =====================================
      DASHBOARD
  =====================================
  */

  dashboard() {
    return Promise.all([
      this.prisma.user.count(),

      this.prisma.wallet.aggregate({
        _sum: {
          balance: true,
        },
      }),

      this.prisma.order.count(),

      this.prisma.order.count({
        where: {
          status: "ACTIVE",
        },
      }),

      this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.SUCCESS,
        },
        _sum: {
          amount: true,
        },
      }),

      this.prisma.payment.count(),

      this.prisma.socialLog.count(),

      this.prisma.socialLog.count({
        where: {
          status: SocialLogStatus.AVAILABLE,
        },
      }),
    ]);
  }

  /*
  =====================================
      USERS
  =====================================
  */

  users() {
    return this.prisma.user.findMany({
      include: {
        wallet: true,
        _count: {
          select: {
            orders: true,
            payments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  user(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        wallet: true,
        orders: true,
        payments: true,
        _count: {
          select: {
            orders: true,
            payments: true,
          },
        },
      },
    });
  }

  updateUser(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
      include: {
        wallet: true,
        _count: {
          select: {
            orders: true,
            payments: true,
          },
        },
      },
    });
  }

  /*
  =====================================
      ORDERS
  =====================================
  */

  orders() {
    return this.prisma.order.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  orderById(id: string): Promise<OrderWithUserWallet | null> {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            wallet: true,
          },
        },
      },
    });
  }

  // Credits the user's wallet with the order's exact selling price and
  // marks the order as refunded, all inside one DB transaction so the
  // wallet credit and the refundedAt flag can never end up out of sync.
  refundOrder(order: OrderWithUserWallet) {
    const amount = order.sellingPriceNgn;
    const balanceBefore = order.user.wallet!.balance;
    const balanceAfter = balanceBefore.plus(amount);

    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.update({
        where: { userId: order.userId },
        data: {
          balance: { increment: amount },
        },
      });

      const transaction = await tx.walletTransaction.create({
        data: {
          userId: order.userId,
          type: "REFUND",
          amount,
          description: `Refund for order ${order.id} (${order.service} / ${order.country})`,
          reference: `refund_order_${order.id}`,
          status: "SUCCESS",
          balanceBefore,
          balanceAfter,
          metadata: {
            source: "ORDER_REFUND",
            orderId: order.id,
          },
        },
      });

      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: { refundedAt: new Date() },
      });

      return { order: updatedOrder, wallet, transaction };
    });
  }

  /*
  =====================================
      PAYMENTS
  =====================================
  */

  payments() {
    return this.prisma.payment.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /*
  =====================================
      TRANSACTIONS
  =====================================
  */

  transactions() {
    return this.prisma.walletTransaction.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  transactionById(id: string): Promise<TransactionWithUserWallet | null> {
    return this.prisma.walletTransaction.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            wallet: true,
          },
        },
      },
    });
  }

  // Credits the user's wallet with the exact original transaction amount
  // and marks that transaction as refunded, in a single DB transaction.
  refundTransaction(transaction: TransactionWithUserWallet) {
    const amount = transaction.amount;
    const balanceBefore = transaction.user.wallet!.balance;
    const balanceAfter = balanceBefore.plus(amount);

    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.update({
        where: { userId: transaction.userId },
        data: {
          balance: { increment: amount },
        },
      });

      const refund = await tx.walletTransaction.create({
        data: {
          userId: transaction.userId,
          type: "REFUND",
          amount,
          description: `Refund for transaction ${transaction.reference}`,
          reference: `refund_txn_${transaction.id}`,
          status: "SUCCESS",
          balanceBefore,
          balanceAfter,
          metadata: {
            source: "TRANSACTION_REFUND",
            originalTransactionId: transaction.id,
          },
        },
      });

      const updatedTransaction = await tx.walletTransaction.update({
        where: { id: transaction.id },
        data: { refundedAt: new Date() },
      });

      return { transaction: updatedTransaction, wallet, refund };
    });
  }
}
