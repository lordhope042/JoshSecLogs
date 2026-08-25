import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VirtualAccountRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /*
  =====================================
       FIND
  =====================================
  */

  async findByUserAndBank(userId: string, bank: string) {
    return this.prisma.virtualAccount.findUnique({
      where: {
        userId_bank: {
          userId,
          bank,
        },
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.virtualAccount.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findByAccountNumber(accountNumber: string) {
    return this.prisma.virtualAccount.findUnique({
      where: {
        accountNumber,
      },
    });
  }

  /*
  =====================================
      CREATE
  =====================================
  */

  async create(data: {
    userId: string;
    bank: string;
    accountNumber: string;
    accountName: string;
  }) {
    return this.prisma.virtualAccount.create({
      data,
    });
  }
}
