import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";

import {
  Prisma,
  SocialPlatform,
  SocialLogCategory,
  SocialLogStatus,
  TransactionStatus,
  TransactionType,
} from "@prisma/client";

import { randomUUID } from "crypto";

import { PrismaService } from "../prisma/prisma.service";

import { CreateSocialLogDto } from "./dto/create-social-log.dto";
import { UpdateSocialLogDto } from "./dto/update-social-log.dto";

const PURCHASED_SELECT = {
  id: true,
  platform: true,
  category: true,
  pageType: true,
  followers: true,
  username: true,
  country: true,
  price: true,
  status: true,
  purchasedAt: true,
  loginEmail: true,
  loginPhone: true,
  password: true,
  twoFactorSecret: true,
  recoveryEmail: true,
  backupCodes: true,
  cookies: true,
  notes: true,
} as Prisma.SocialLogSelect;

@Injectable()
export class SocialLogRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /*
  =====================================
  PUBLIC — CATEGORY (marketplace tabs)
  =====================================
  */

  // Groups by the 10-item `category` enum — this is what
  // CategoryTabs / useSocialLogs.loadCategories() should consume now,
  // not the old platform grouping below.
  async categories() {
    return this.prisma.socialLog.groupBy({
      by: ["category"],
      where: {
        status: SocialLogStatus.AVAILABLE,
      },
      _count: {
        category: true,
      },
      orderBy: {
        category: "asc",
      },
    });
  }

  async findByCategory(
    category: SocialLogCategory,
  ) {
    return this.prisma.socialLog.findMany({
      where: {
        category,
        status: SocialLogStatus.AVAILABLE,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /*
  =====================================
  PUBLIC — PLATFORM (legacy / admin filtering)
  =====================================
  */

  async platforms() {
    return this.prisma.socialLog.groupBy({
      by: ["platform"],
      where: {
        status: SocialLogStatus.AVAILABLE,
      },
      _count: {
        platform: true,
      },
      orderBy: {
        platform: "asc",
      },
    });
  }

  async findMany(
    platform?: SocialPlatform,
  ) {
    return this.prisma.socialLog.findMany({
      where: {
        status: SocialLogStatus.AVAILABLE,

        ...(platform && {
          platform,
        }),
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findAll() {
    return this.prisma.socialLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findByPlatform(
    platform: SocialPlatform,
  ) {
    return this.prisma.socialLog.findMany({
      where: {
        platform,
        status: SocialLogStatus.AVAILABLE,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: string) {
    return this.prisma.socialLog.findUnique({
      where: {
        id,
      },
    });
  }

  /*
  =====================================
  CREATE
  =====================================
  */

  async create(dto: CreateSocialLogDto) {
    const { accountPassword, ...rest } = dto;

    return this.prisma.socialLog.create({
      data: {
        ...rest,
        password: accountPassword,
      },
    });
  }

  /*
  =====================================
  UPDATE
  =====================================
  */

  async update(
    id: string,
    dto: UpdateSocialLogDto,
  ) {
    const { accountPassword, ...rest } = dto;

    return this.prisma.socialLog.update({
      where: {
        id,
      },

      data: {
        ...rest,
        ...(accountPassword !== undefined && {
          password: accountPassword,
        }),
      },
    });
  }

  /*
  =====================================
  DELETE
  =====================================
  */

  async delete(id: string) {
    return this.prisma.socialLog.delete({
      where: {
        id,
      },
    });
  }

  /*
  =====================================
  PURCHASE
  =====================================
  */

  async purchase(
    id: string,
    buyerId: string,
  ) {
    return this.prisma.$transaction(
      async (tx) => {
        const log =
          await tx.socialLog.findUnique({
            where: { id },
          });

        if (!log) {
          throw new NotFoundException(
            "Social account not found.",
          );
        }

        if (
          log.status ===
          SocialLogStatus.SOLD
        ) {
          throw new BadRequestException(
            "This account has already been sold.",
          );
        }

        const wallet =
          await tx.wallet.findUnique({
            where: {
              userId: buyerId,
            },
          });

        if (!wallet) {
          throw new NotFoundException(
            "Wallet not found.",
          );
        }

        const balance =
          Number(wallet.balance);

        const price =
          Number(log.price);

        if (balance < price) {
          throw new BadRequestException(
            "Insufficient wallet balance.",
          );
        }

        const newBalance =
          balance - price;

        await tx.wallet.update({
          where: {
            userId: buyerId,
          },
          data: {
            balance: newBalance,
          },
        });

        await tx.walletTransaction.create({
          data: {
            userId: buyerId,

            type:
              TransactionType.PURCHASE,

            status:
              TransactionStatus.SUCCESS,

            amount: log.price,

            balanceBefore: balance,

            balanceAfter: newBalance,

            description: `${log.platform} account purchase`,

            reference: randomUUID(),
          },
        });

        await tx.socialLog.update({
          where: {
            id,
          },

          data: {
            status:
              SocialLogStatus.SOLD,

            purchasedAt: new Date(),

            buyer: {
              connect: {
                id: buyerId,
              },
            },
          },
        });

        /*
        =====================================
        RETURN LOGIN DETAILS
        =====================================
        */

        return tx.socialLog.findUnique({
          where: {
            id,
          },

          select: PURCHASED_SELECT,
        });
      },
    );
  }

  /*
  =====================================
  ADMIN MARK SOLD
  =====================================
  */

  async markSold(
    id: string,
    buyerId: string,
  ) {
    return this.prisma.socialLog.update({
      where: {
        id,
      },

      data: {
        status:
          SocialLogStatus.SOLD,

        purchasedAt: new Date(),

        buyer: {
          connect: {
            id: buyerId,
          },
        },
      },
    });
  }

  /*
  =====================================
  PURCHASE HISTORY
  =====================================
  */

  async getPurchasedAccount(
    id: string,
    buyerId: string,
  ) {
    return this.prisma.socialLog.findFirst({
      where: {
        id,

        buyerId,
      },

      select: PURCHASED_SELECT,
    });
  }

  /*
  =====================================
  USER PURCHASES
  =====================================
  */

  async getPurchasedAccounts(
    buyerId: string,
  ) {
    return this.prisma.socialLog.findMany({
      where: {
        buyerId,
      },

      orderBy: {
        updatedAt: "desc",
      },

      select: {
        id: true,
        platform: true,
        category: true,
        pageType: true,
        followers: true,
        username: true,
        country: true,
        price: true,
        status: true,
        purchasedAt: true,
        updatedAt: true,
      },
    });
  }
}