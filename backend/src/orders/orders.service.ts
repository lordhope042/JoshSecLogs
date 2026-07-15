import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /*
  =====================================
      PURCHASE HISTORY
  =====================================
  */

  async getAllOrders(userId: string) {
    return this.prisma.order.findMany({
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
      SINGLE ORDER
  =====================================
  */

  async getOrderById(
    userId: string,
    orderId: string,
  ) {
    const order =
      await this.prisma.order.findFirst({
        where: {
          id: orderId,
          userId,
        },
        include: {
          smsMessages: true,
        },
      });

    if (!order) {
      throw new NotFoundException(
        'Order not found',
      );
    }

    return order;
  }
}