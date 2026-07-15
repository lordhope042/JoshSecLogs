import { Injectable } from '@nestjs/common';
import {
  Payment,
  PaymentStatus,
  Prisma,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /*
  =====================================
      CREATE PAYMENT
  =====================================
  */

  async create(data: {
    userId: string;
    amount: number;
    reference: string;
    provider?: string;
  }): Promise<Payment> {
    return this.prisma.payment.create({
      data: {
        userId: data.userId,
        amount: new Prisma.Decimal(data.amount),
        reference: data.reference,
        provider: data.provider ?? 'PAYSTACK',
        currency: 'NGN',
        status: PaymentStatus.PENDING,
      },
    });
  }

  /*
  =====================================
      FIND
  =====================================
  */

  async findByReference(reference: string) {
    return this.prisma.payment.findUnique({
      where: {
        reference,
      },
    });
  }

  async userPayment(
    userId: string,
    reference: string,
  ) {
    return this.prisma.payment.findFirst({
      where: {
        userId,
        reference,
      },
    });
  }

  async userPayments(userId: string) {
    return this.prisma.payment.findMany({
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
      GATEWAY REFERENCE
  =====================================
  */

  async updateGatewayReference(
    reference: string,
    gatewayReference: string,
  ) {
    return this.prisma.payment.update({
      where: {
        reference,
      },
      data: {
        gatewayReference,
      },
    });
  }

  /*
  =====================================
      UPDATE STATUS
  =====================================
  */

  async updateStatus(
    reference: string,
    status: PaymentStatus,
    providerResponse?: Prisma.InputJsonValue,
  ) {
    return this.prisma.payment.update({
      where: {
        reference,
      },
      data: {
        status,
        providerResponse,

        verifiedAt: new Date(),

        ...(status ===
          PaymentStatus.SUCCESS && {
          paidAt: new Date(),
        }),
      },
    });
  }

  /*
  =====================================
      SUCCESS
  =====================================
  */

  async markSuccessful(
    reference: string,
    gatewayReference: string,
    providerResponse?: Prisma.InputJsonValue,
  ) {
    return this.prisma.payment.update({
      where: {
        reference,
      },
      data: {
        status: PaymentStatus.SUCCESS,
        gatewayReference,
        providerResponse,
        verifiedAt: new Date(),
        paidAt: new Date(),
      },
    });
  }

  /*
  =====================================
      FAILED
  =====================================
  */

  async markFailed(
    reference: string,
    providerResponse?: Prisma.InputJsonValue,
  ) {
    return this.prisma.payment.update({
      where: {
        reference,
      },
      data: {
        status: PaymentStatus.FAILED,
        providerResponse,
        verifiedAt: new Date(),
      },
    });
  }

  /*
  =====================================
      DELETE
  =====================================
  */

  async delete(reference: string) {
    return this.prisma.payment.delete({
      where: {
        reference,
      },
    });
  }
}