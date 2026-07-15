import { Injectable } from "@nestjs/common";

import {
  Prisma,
  PaymentStatus,
  SocialLogStatus,
} from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

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

  updateUser(
    id: string,
    data: Prisma.UserUpdateInput,
  ) {
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
}