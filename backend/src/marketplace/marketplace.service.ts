import {
  Injectable,
  BadGatewayException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { FiveSimService } from '../providers/fivesim/fivesim.service';
import { OrderStatus } from '@prisma/client';

import { BuyNumberDto } from './dto/buy-number.dto';

@Injectable()
export class MarketplaceService {
  private readonly logger = new Logger(
    MarketplaceService.name,
  );

  constructor(
    private readonly fiveSim: FiveSimService,
    private readonly wallet: WalletService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /* ============================================================
                          CONFIG
  ============================================================ */

  private get usdRate(): number {
    return Number(
      this.config.get<number>('USD_TO_NGN') ??
        1650,
    );
  }

  private get markup(): number {
    return Number(
      this.config.get<number>('MARKUP') ??
        1.2,
    );
  }

  private convertPrice(
    usd: number,
  ): number {
    return Math.ceil(
      usd * this.usdRate * this.markup,
    );
  }

  /* ============================================================
                        COUNTRIES
  ============================================================ */

  async countries() {
    try {
      const response =
        await this.fiveSim.countries();

      return Object.entries(
        response ?? {},
      )
        .map(([code, item]: any) => ({
          id: code,

          code,

          name:
            item?.text ??
            item?.name ??
            code,

          iso:
            Object.keys(item?.iso ?? {})[0] ??
            code,

          prefix:
            Object.keys(
              item?.prefix ?? {},
            )[0] ?? '',

          flag:
            item?.flag ??
            item?.img ??
            null,
        }))
        .sort((a, b) =>
          a.name.localeCompare(b.name),
        );
    } catch (error) {
      this.logger.error(
        'Failed loading countries',
        error,
      );

      throw new BadGatewayException(
        'Unable to load countries.',
      );
    }
  }

  /* ============================================================
                        PRODUCTS
  ============================================================ */

  async products(country: string) {
    try {
      const response =
        await this.fiveSim.products(
          country,
        );

      return Object.entries(
        response ?? {},
      )
        .map(([service, item]: any) => ({
          id: service,

          service,

          name:
            item?.text ??
            item?.name ??
            service,

          image:
            item?.image ??
            item?.img ??
            null,
        }))
        .sort((a, b) =>
          a.name.localeCompare(b.name),
        );
    } catch (error) {
      this.logger.error(
        `Failed loading products for ${country}`,
        error,
      );

      throw new BadGatewayException(
        'Unable to load products.',
      );
    }
  }

  /* ============================================================
                          PRICES
  ============================================================ */

  async prices(country: string) {
    try {
      const response: any =
        await this.fiveSim.prices(
          country,
        );

      const services =
        response?.[country] ?? {};

      return Object.entries(
        services,
      )
        .map(
          ([service, activations]: any) => ({
            service,

            activationTypes:
              Object.entries(
                activations ?? {},
              )
                .map(
                  ([
                    activationType,
                    info,
                  ]: any) => {
                    const usd =
                      Number(
                        info?.cost ?? 0,
                      );

                    return {
                      activationType,

                      stock: Number(
                        info?.count ?? 0,
                      ),

                      priceUsd: usd,

                      priceNgn:
                        this.convertPrice(
                          usd,
                        ),
                    };
                  },
                )
                .sort(
                  (a, b) =>
                    a.priceNgn -
                    b.priceNgn,
                ),
          }),
        )
        .filter(
          (service: any) =>
            service.activationTypes
              .length > 0,
        )
        .sort((a, b) =>
          a.service.localeCompare(
            b.service,
          ),
        );
    } catch (error) {
      this.logger.error(
        `Failed loading prices for ${country}`,
        error,
      );

      throw new BadGatewayException(
        'Unable to load prices.',
      );
    }
  }

  /* ============================================================
                    PURCHASE HELPERS
  ============================================================ */

  private async validatePurchase(
    country: string,
    operator: string,
    product: string,
  ) {
    const services = await this.prices(country);

    const service = services.find(
      (s: any) => s.service === product,
    );

    if (!service) {
      throw new BadRequestException(
        'Selected service is unavailable.',
      );
    }

    const activation =
      service.activationTypes.find(
        (a: any) =>
          a.activationType === operator,
      );

    if (!activation) {
      throw new BadRequestException(
        'Selected activation type is unavailable.',
      );
    }

    if (activation.stock <= 0) {
      throw new BadRequestException(
        'This number is currently out of stock.',
      );
    }

    return activation;
  }

  private async purchaseFromProvider(
    country: string,
    operator: string,
    product: string,
  ) {
    const purchase =
      await this.fiveSim.buy(
        country,
        operator,
        product,
      );

    if (!purchase?.id) {
      throw new BadGatewayException(
        'Provider failed to allocate a number.',
      );
    }

    return purchase;
  }

  private async createOrder(
    userId: string,
    purchase: any,
    dto: BuyNumberDto,
    amount: number,
  ) {
    return this.prisma.order.create({
      data: {
        userId,

        provider: 'FIVESIM',

        providerOrderId: String(
          purchase.id,
        ),

        country: dto.country,

        operator:
          dto.operator ?? 'any',

        activationType:
          dto.operator ?? 'any',

        service: dto.product,

        phoneNumber:
          purchase.phone,

        providerCostUsd:
          String(purchase.price ?? 0),

        sellingPriceNgn:
          String(amount),

        status: OrderStatus.ACTIVE,
      },
    });
  }

  private async refundPurchase(
    userId: string,
    amount: number,
    product: string,
  ) {
    return this.wallet.creditWallet(
      userId,
      amount,
    );
  }

  /* ============================================================
              PROVIDER STATUS MAPPING
  ============================================================ */

  /**
   * 5sim raw statuses: PENDING, RECEIVED, CANCELED, TIMEOUT, FINISHED, BANNED
   * Maps them onto our OrderStatus enum. Single source of truth —
   * used by syncOrder() and cancel() so they can never drift apart
   * the way the old syncOrder() did with `provider.status.toUpperCase() as any`.
   */
  private mapProviderStatus(
    rawStatus: string | undefined,
  ): OrderStatus {
    const providerStatus = rawStatus?.toUpperCase?.() ?? '';

    switch (providerStatus) {
      case 'PENDING':
        return OrderStatus.PENDING;

      case 'RECEIVED':
        return OrderStatus.ACTIVE;

      case 'FINISHED':
        return OrderStatus.COMPLETED;

      case 'CANCELED':
      case 'CANCELLED':
        return OrderStatus.CANCELLED;

      case 'TIMEOUT':
        return OrderStatus.TIMEOUT;

      case 'BANNED':
        return OrderStatus.BANNED;

      default:
        this.logger.warn(
          `Unmapped provider status "${rawStatus}" — defaulting to PENDING`,
        );
        return OrderStatus.PENDING;
    }
  }

  /* ============================================================
                        BUY NUMBER
  ============================================================ */

  async buy(
    userId: string,
    dto: BuyNumberDto,
  ) {
    const operator =
      dto.operator ?? 'any';

    // Validate stock & selling price
    const activation =
      await this.validatePurchase(
        dto.country,
        operator,
        dto.product,
      );

    const amount =
      activation.priceNgn;

    // Debit wallet
    await this.wallet.debitWallet(
      userId,
      amount,
      `Purchase ${dto.product}`,
    );

    try {
      // Buy from provider
      const purchase =
        await this.purchaseFromProvider(
          dto.country,
          operator,
          dto.product,
        );

      // Save order
      const order =
        await this.createOrder(
          userId,
          purchase,
          dto,
          amount,
        );

      return {
        success: true,
        message:
          'Number purchased successfully.',
        order,
        purchase,
      };
    } catch (error) {
      // Refund wallet if provider fails
      await this.refundPurchase(
        userId,
        amount,
        dto.product,
      );

      throw error;
    }
  }

  /* ============================================================
                        USER ORDERS
  ============================================================ */

  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getOrder(
    userId: string,
    orderId: string,
  ) {
    const order =
      await this.prisma.order.findFirst({
        where: {
          id: orderId,
          userId,
        },
      });

    if (!order) {
      throw new NotFoundException(
        'Order not found.',
      );
    }

    return order;
  }

  /* ============================================================
                        SYNC ORDER
  ============================================================ */

  async syncOrder(
    userId: string,
    orderId: string,
  ) {
    const order =
      await this.getOrder(
        userId,
        orderId,
      );

    const provider =
      await this.fiveSim.check(
        Number(order.providerOrderId),
      );

    const status = this.mapProviderStatus(
      (provider as any)?.status,
    );

    // ── Auto-refund on terminal failure states ──
    // When a virtual number times out without receiving an SMS (or
    // the provider otherwise fails the activation), the user has
    // paid for a number that delivered no value. Refund the full
    // selling price back to their wallet so their balance is
    // restored. This is idempotent: once refundedAt is set we never
    // refund the same order twice, even if sync is called again.
    const shouldRefund =
      (status === OrderStatus.TIMEOUT ||
        status === OrderStatus.FAILED) &&
      order.refundedAt === null;

    if (shouldRefund) {
      try {
        await this.wallet.credit(
          userId,
          Number(order.sellingPriceNgn),
          `Refund for timed-out ${order.service}`,
        );

        await this.prisma.order.update({
          where: { id: order.id },
          data: {
            status,
            refundedAt: new Date(),
          },
        });

        this.logger.log(
          `Auto-refunded order ${order.id} (status=${status}) — ₦${order.sellingPriceNgn} returned to user ${userId}.`,
        );
      } catch (err) {
        // Don't swallow the status update if the refund fails —
        // still persist the new status so the UI reflects reality,
        // but log loudly so it can be reconciled manually.
        this.logger.error(
          `Refund failed for order ${order.id} on status=${status}: ${err instanceof Error ? err.message : String(err)}`,
        );

        await this.prisma.order.update({
          where: { id: order.id },
          data: { status },
        });
      }
    } else {
      await this.prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          status,
        },
      });
    }

    return {
      ...provider,
      mappedStatus: status,
      refunded: shouldRefund,
    };
  }

  /* ============================================================
                        SMS
  ============================================================ */
async sms(userId: string, orderId: string) {
  const order = await this.getOrder(userId, orderId);

  const provider = await this.fiveSim.check(Number(order.providerOrderId));

  return {
    Data: provider.sms && provider.sms.length > 0 ? provider.sms : null,
    Total: provider.sms?.length ?? 0,
  };
}

  /* ============================================================
                        FINISH
  ============================================================ */

  async finish(
    userId: string,
    orderId: string,
  ) {
    const order =
      await this.getOrder(
        userId,
        orderId,
      );

    await this.fiveSim.finish(
      Number(order.providerOrderId),
    );

    await this.prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: OrderStatus.COMPLETED,
      },
    });

    return {
      success: true,
      message: 'Order completed successfully.',
    };
  }

  /* ============================================================
                        CANCEL
  ============================================================ */

  async cancel(
    userId: string,
    orderId: string,
  ) {
    const order = await this.getOrder(
      userId,
      orderId,
    );

    if (
      order.status === OrderStatus.CANCELLED ||
      order.status === OrderStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Order has already been processed.',
      );
    }

    const provider =
      await this.fiveSim.cancel(
        Number(order.providerOrderId),
      );

    const status = this.mapProviderStatus(
      (provider as any)?.status,
    );

    // Refund on a genuine cancellation OR a timeout. A timeout means
    // the number expired without receiving an SMS — the user paid for
    // a number that delivered no value, so their wallet should be
    // restored. Guard with refundedAt so a second cancel/sync can't
    // double-refund.
    const shouldRefund =
      (status === OrderStatus.CANCELLED ||
        status === OrderStatus.TIMEOUT) &&
      order.refundedAt === null;

    await this.prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        status,
        ...(shouldRefund ? { refundedAt: new Date() } : {}),
      },
    });

    if (shouldRefund) {
      try {
        await this.wallet.credit(
          userId,
          Number(order.sellingPriceNgn),
          status === OrderStatus.TIMEOUT
            ? `Refund for timed-out ${order.service}`
            : `Refund for cancelled ${order.service}`,
        );
      } catch (err) {
        // Revert the refundedAt marker if the credit failed, so a
        // later sync can retry the refund.
        await this.prisma.order.update({
          where: { id: order.id },
          data: { refundedAt: null },
        });
        this.logger.error(
          `Cancel refund failed for order ${order.id}: ${err instanceof Error ? err.message : String(err)}`,
        );
        throw err;
      }
    }

    return {
      success: true,
      providerStatus:
        (provider as any)?.status?.toUpperCase?.() ?? 'UNKNOWN',
      status,
      refunded: shouldRefund,
    };
  }

  /* ============================================================
                        BAN
  ============================================================ */

  async ban(
    userId: string,
    orderId: string,
  ) {
    const order =
      await this.getOrder(
        userId,
        orderId,
      );

    if (
      order.status === OrderStatus.CANCELLED ||
      order.status === OrderStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Order has already been processed.',
      );
    }

    await this.fiveSim.ban(
      Number(order.providerOrderId),
    );

    await this.prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: OrderStatus.BANNED,
      },
    });

    return {
      success: true,
      message: 'Number banned successfully.',
    };
  }
}