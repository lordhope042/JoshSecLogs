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
import { GrizzySmsService } from '../providers/grizzysms/grizzysms.service';
import { SmsBowerService } from '../providers/smsbower/smsbower.service';
import { OrderStatus } from '@prisma/client';

import { BuyNumberDto } from './dto/buy-number.dto';

type Provider = 'FIVESIM' | 'GRIZZYSMS' | 'SMSBOWER';

@Injectable()
export class MarketplaceService {
  private readonly logger = new Logger(
    MarketplaceService.name,
  );

  constructor(
    private readonly fiveSim: FiveSimService,
    private readonly grizzySms: GrizzySmsService,
    private readonly smsBower: SmsBowerService,
    private readonly wallet: WalletService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /* ============================================================
                          CONFIG
  ============================================================ */

  private get usdRate(): number {
    return Number(
      this.config.get<number>('USD_TO_NGN') ?? 1650,
    );
  }

  private get markup(): number {
    return Number(
      this.config.get<number>('MARKUP') ?? 1.2,
    );
  }

  private convertPrice(usd: number): number {
    return Math.ceil(
      usd * this.usdRate * this.markup,
    );
  }

  /* ============================================================
                        COUNTRIES
  ============================================================ */

  async countries(provider: Provider = 'FIVESIM') {
    if (provider === 'GRIZZYSMS') {
      return this.grizzyCountries();
    }

    if (provider === 'SMSBOWER') {
      return this.smsBowerCountries();
    }

    return this.fiveSimCountries();
  }

  private async fiveSimCountries() {
    try {
      const response = await this.fiveSim.countries();

      return Object.entries(response ?? {})
        .map(([code, item]: any) => ({
          id: code,
          code,
          name: item?.text ?? item?.name ?? code,
          iso: Object.keys(item?.iso ?? {})[0] ?? code,
          prefix: Object.keys(item?.prefix ?? {})[0] ?? '',
          flag: item?.flag ?? item?.img ?? null,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      this.logger.error(
        'Failed loading FiveSIM countries',
        error,
      );

      throw new BadGatewayException(
        'Unable to load countries.',
      );
    }
  }

  private async grizzyCountries() {
    try {
      const [prices, namedList] = await Promise.all([
        this.grizzySms.getPricesV2(),
        this.grizzySms.getCountriesList(),
      ]);

      const nameMap = new Map(
        (namedList ?? []).map((country) => [
          country.id,
          country.name,
        ]),
      );

      return Object.keys(prices ?? {})
        .map((id) => ({
          id,
          code: id,
          name: nameMap.get(id) ?? `Country ${id}`,
          iso: id,
          prefix: '',
          flag: null,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      this.logger.error(
        'Failed loading GrizzySMS countries',
        error,
      );

      throw new BadGatewayException(
        'Unable to load countries.',
      );
    }
  }

  private async smsBowerCountries() {
    try {
      const [prices, namedList] = await Promise.all([
        this.smsBower.getPricesV2(),
        this.smsBower.getCountriesList(),
      ]);

      const nameMap = new Map(
        (namedList ?? []).map((country) => [
          country.id,
          country.name,
        ]),
      );

      return Object.keys(prices ?? {})
        .map((id) => ({
          id,
          code: id,
          name: nameMap.get(id) ?? `Country ${id}`,
          iso: id,
          prefix: '',
          flag: null,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      this.logger.error(
        'Failed loading SMSBower countries',
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

  async products(
    country: string,
    provider: Provider = 'FIVESIM',
  ) {
    if (provider === 'GRIZZYSMS') {
      return this.grizzyProducts(country);
    }

    if (provider === 'SMSBOWER') {
      return this.smsBowerProducts(country);
    }

    return this.fiveSimProducts(country);
  }

  private async fiveSimProducts(country: string) {
    try {
      const response = await this.fiveSim.products(country);

      return Object.entries(response ?? {})
        .map(([service, item]: any) => ({
          id: service,
          service,
          name: item?.text ?? item?.name ?? service,
          image: item?.image ?? item?.img ?? null,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      this.logger.error(
        `Failed loading FiveSIM products for ${country}`,
        error,
      );

      throw new BadGatewayException(
        'Unable to load products.',
      );
    }
  }

  private async grizzyProducts(country: string) {
    try {
      const [rawPrices, namedList] = await Promise.all([
        this.grizzySms.getPricesV2(undefined, country),
        this.grizzySms.getServicesList(),
      ]);

      const nameMap = new Map(
        (namedList ?? []).map((service) => [
          service.code,
          service.name,
        ]),
      );

      const response: any = rawPrices;
      const nested = response?.[country];

      const services =
        nested && typeof nested === 'object'
          ? nested
          : response && typeof response === 'object'
            ? response
            : {};

      return Object.keys(services)
        .map((code) => ({
          id: code,
          service: code,
          name: nameMap.get(code) ?? code,
          image: null,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      this.logger.error(
        `Failed loading GrizzySMS products for ${country}`,
        error,
      );

      throw new BadGatewayException(
        'Unable to load products.',
      );
    }
  }

  private async smsBowerProducts(country: string) {
    try {
      const [rawPrices, namedList] = await Promise.all([
        this.smsBower.getPricesV2(undefined, country),
        this.smsBower.getServicesList(),
      ]);

      const nameMap = new Map(
        (namedList ?? []).map((service) => [
          service.code,
          service.name,
        ]),
      );

      const response: any = rawPrices;
      const nested = response?.[country];

      const services =
        nested && typeof nested === 'object'
          ? nested
          : response && typeof response === 'object'
            ? response
            : {};

      return Object.keys(services)
        .map((code) => ({
          id: code,
          service: code,
          name: nameMap.get(code) ?? code,
          image: null,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      this.logger.error(
        `Failed loading SMSBower products for ${country}`,
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

  async prices(
    country: string,
    provider: Provider = 'FIVESIM',
  ) {
    if (provider === 'GRIZZYSMS') {
      return this.grizzyPrices(country);
    }

    if (provider === 'SMSBOWER') {
      return this.smsBowerPrices(country);
    }

    return this.fiveSimPrices(country);
  }

  private async fiveSimPrices(country: string) {
    try {
      const response: any = await this.fiveSim.prices(country);
      const services = response?.[country] ?? {};

      return Object.entries(services)
        .map(([service, activations]: any) => ({
          service,
          activationTypes: Object.entries(activations ?? {})
            .map(([activationType, info]: any) => {
              const usd = Number(info?.cost ?? 0);

              return {
                activationType,
                stock: Number(info?.count ?? 0),
                priceUsd: usd,
                priceNgn: this.convertPrice(usd),
              };
            })
            .sort((a, b) => a.priceNgn - b.priceNgn),
        }))
        .filter(
          (service: any) =>
            service.activationTypes.length > 0,
        )
        .sort((a, b) =>
          a.service.localeCompare(b.service),
        );
    } catch (error) {
      this.logger.error(
        `Failed loading FiveSIM prices for ${country}`,
        error,
      );

      throw new BadGatewayException(
        'Unable to load prices.',
      );
    }
  }

  /**
   * GrizzySMS uses one price and stock count per service/country.
   * The response is normalized to one activation type: "any".
   */
  private async grizzyPrices(country: string) {
    try {
      const response: any =
        await this.grizzySms.getPricesV2(undefined, country);

      const nested = response?.[country];

      const services =
        nested && typeof nested === 'object'
          ? nested
          : response && typeof response === 'object'
            ? response
            : {};

      const sampleEntry = Object.entries(services)[0];

      this.logger.debug(
        `GrizzySMS prices raw sample for country=${country}: ${JSON.stringify(sampleEntry)}`,
      );

      const resolvePriceAndStock = (
        info: any,
      ): { usd: number; stock: number } => {
        if (info && typeof info === 'object') {
          const entries = Object.entries(info);

          if (
            entries.length === 1 &&
            !('cost' in info) &&
            !('price' in info) &&
            !('count' in info) &&
            !('qty' in info)
          ) {
            const [priceStr, stockVal] = entries[0];
            const usd = Number(priceStr);
            const stock = Number(stockVal);

            if (!Number.isNaN(usd)) {
              return {
                usd,
                stock: Number.isNaN(stock) ? 0 : stock,
              };
            }
          }
        }

        const usd = Number(
          info?.cost ??
            info?.price ??
            info?.retail_price ??
            info?.real_price ??
            0,
        );

        const stock = Number(
          info?.count ??
            info?.qty ??
            info?.quantity ??
            info?.available ??
            info?.stock ??
            0,
        );

        return { usd, stock };
      };

      return Object.entries(services)
        .map(([service, info]: any) => {
          const { usd, stock } = resolvePriceAndStock(info);

          return {
            service,
            activationTypes: [
              {
                activationType: 'any',
                stock,
                priceUsd: usd,
                priceNgn: this.convertPrice(usd),
              },
            ],
          };
        })
        .sort((a, b) => a.service.localeCompare(b.service));
    } catch (error) {
      this.logger.error(
        `Failed loading GrizzySMS prices for ${country}`,
        error,
      );

      throw new BadGatewayException(
        'Unable to load prices.',
      );
    }
  }

  /**
   * Resolve one service entry from SMSBower getPricesV2.
   *
   * Documented shape: { "<price1>": stock1, "<price2>": stock2, ... },
   * one key per price tier. Named-field shapes ({ cost, count }) are
   * still accepted as a fallback.
   *
   * Returns the cheapest tier that has stock. If no tier has stock,
   * returns the cheapest tier with stock 0, so the service still
   * appears (as out of stock) instead of showing a price of 0.
   */
  private resolveSmsBowerTier(info: any): {
    usd: number;
    stock: number;
  } {
    if (info && typeof info === 'object') {
      const hasNamedFields =
        'cost' in info ||
        'price' in info ||
        'count' in info ||
        'qty' in info;

      if (!hasNamedFields) {
        const tiers = Object.entries(info)
          .map(([priceStr, stockVal]: [string, any]) => {
            const stock =
              stockVal && typeof stockVal === 'object'
                ? Number(stockVal.count ?? stockVal.qty)
                : Number(stockVal);

            return {
              usd: Number(priceStr),
              stock: Number.isFinite(stock) ? stock : 0,
            };
          })
          .filter((tier) => Number.isFinite(tier.usd))
          .sort((a, b) => a.usd - b.usd);

        if (tiers.length > 0) {
          return tiers.find((tier) => tier.stock > 0) ?? tiers[0];
        }
      }
    }

    const usd = Number(
      info?.cost ??
        info?.price ??
        info?.retail_price ??
        info?.real_price ??
        0,
    );

    const stock = Number(
      info?.count ??
        info?.qty ??
        info?.quantity ??
        info?.available ??
        info?.stock ??
        0,
    );

    return {
      usd: Number.isFinite(usd) ? usd : 0,
      stock: Number.isFinite(stock) ? stock : 0,
    };
  }

  /**
   * SMSBower prices are normalized to the same response shape as
   * GrizzySMS, using the cheapest in-stock price tier per service.
   */
  private async smsBowerPrices(country: string) {
    try {
      const response: any =
        await this.smsBower.getPricesV2(undefined, country);

      const nested = response?.[country];

      const services =
        nested && typeof nested === 'object'
          ? nested
          : response && typeof response === 'object'
            ? response
            : {};

      const sampleEntry = Object.entries(services)[0];

      this.logger.debug(
        `SMSBower prices raw sample for country=${country}: ${JSON.stringify(sampleEntry)}`,
      );

      return Object.entries(services)
        .map(([service, info]: any) => {
          const { usd, stock } = this.resolveSmsBowerTier(info);

          return {
            service,
            activationTypes: [
              {
                activationType: 'any',
                priceUsd: usd,
                stock,
                priceNgn: this.convertPrice(usd),
              },
            ],
          };
        })
        .sort((a, b) => a.service.localeCompare(b.service));
    } catch (error) {
      this.logger.error(
        `Failed loading SMSBower prices for ${country}`,
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
    provider: Provider,
  ) {
    const services = await this.prices(country, provider);

    const service = services.find(
      (item: any) => item.service === product,
    );

    if (!service) {
      throw new BadRequestException(
        'Selected service is unavailable.',
      );
    }

    const activation = service.activationTypes.find(
      (item: any) => item.activationType === operator,
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
    provider: Provider,
    maxPrice?: number,
  ) {
    if (provider === 'GRIZZYSMS') {
      const purchase = await this.grizzySms.buy(product, country);

      if (!purchase?.id) {
        throw new BadGatewayException(
          'Provider failed to allocate a number.',
        );
      }

      return purchase;
    }

    if (provider === 'SMSBOWER') {
      // maxPrice caps the provider-side cost at the tier the user was
      // quoted, so a pricier tier is never bought at the cheaper price.
      const purchase = await this.smsBower.buy(
        product,
        country,
        maxPrice,
      );

      if (!purchase?.id) {
        throw new BadGatewayException(
          'Provider failed to allocate a number.',
        );
      }

      return purchase;
    }

    const purchase = await this.fiveSim.buy(
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
        provider: dto.provider,
        providerOrderId: String(purchase.id),
        country: dto.country,
        operator: dto.operator ?? 'any',
        activationType: dto.operator ?? 'any',
        service: dto.product,
        phoneNumber: purchase.phone,
        providerCostUsd: String(
          purchase.price ?? purchase.activationCost ?? 0,
        ),
        sellingPriceNgn: String(amount),
        status: OrderStatus.ACTIVE,
      },
    });
  }

  private async refundPurchase(
    userId: string,
    amount: number,
    product: string,
  ) {
    return this.wallet.creditWallet(userId, amount);
  }

  /* ============================================================
                    PROVIDER STATUS MAPPING
  ============================================================ */

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

  private mapGrizzyStatus(
    rawCode: string | undefined,
  ): OrderStatus {
    switch (rawCode) {
      case 'STATUS_WAIT_CODE':
      case 'STATUS_WAIT_RETRY':
      case 'STATUS_WAIT_RESEND':
        return OrderStatus.ACTIVE;

      case 'STATUS_OK':
        return OrderStatus.COMPLETED;

      case 'STATUS_CANCEL':
        return OrderStatus.CANCELLED;

      default:
        this.logger.warn(
          `Unmapped GrizzySMS status "${rawCode}" — defaulting to PENDING`,
        );

        return OrderStatus.PENDING;
    }
  }

  private async checkProviderOrder(order: {
    provider: string;
    providerOrderId: string | null;
  }) {
    try {
      if (order.provider === 'GRIZZYSMS') {
        const result = await this.grizzySms.getStatus(
          order.providerOrderId ?? '',
        );

        return {
          status: this.mapGrizzyStatus(result.code),
          sms:
            result.code === 'STATUS_OK' && result.value
              ? [result.value]
              : null,
          raw: result,
        };
      }

      if (order.provider === 'SMSBOWER') {
        const result = await this.smsBower.getStatus(
          order.providerOrderId ?? '',
        );

        return {
          status: this.mapGrizzyStatus(result.code),
          sms:
            result.code === 'STATUS_OK' && result.value
              ? [result.value]
              : null,
          raw: result,
        };
      }

      const result = await this.fiveSim.check(
        Number(order.providerOrderId),
      );

      return {
        status: this.mapProviderStatus(
          (result as any)?.status,
        ),
        sms: result.sms,
        raw: result,
      };
    } catch (error) {
      this.logger.error(
        `checkProviderOrder failed — provider=${order.provider} providerOrderId=${order.providerOrderId}: ${
          error instanceof Error
            ? error.message
            : String(error)
        }`,
      );

      throw error;
    }
  }

  /* ============================================================
                          BUY NUMBER
  ============================================================ */

  async buy(
    userId: string,
    dto: BuyNumberDto,
  ) {
    const operator = dto.operator ?? 'any';

    const activation = await this.validatePurchase(
      dto.country,
      operator,
      dto.product,
      dto.provider,
    );

    const amount = activation.priceNgn;

    await this.wallet.debitWallet(
      userId,
      amount,
      `Purchase ${dto.product}`,
    );

    try {
      const purchase = await this.purchaseFromProvider(
        dto.country,
        operator,
        dto.product,
        dto.provider,
        dto.provider === 'SMSBOWER'
          ? activation.priceUsd
          : undefined,
      );

      const order = await this.createOrder(
        userId,
        purchase,
        dto,
        amount,
      );

      return {
        success: true,
        message: 'Number purchased successfully.',
        order,
        purchase,
      };
    } catch (error) {
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
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrder(
    userId: string,
    orderId: string,
  ) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
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
    const order = await this.getOrder(userId, orderId);
    const checked = await this.checkProviderOrder(order);
    const status = checked.status;

    const shouldRefund =
      (
        status === OrderStatus.TIMEOUT ||
        status === OrderStatus.FAILED
      ) &&
      order.refundedAt === null;

    if (shouldRefund) {
      try {
        await this.prisma.$transaction(async (tx) => {
          await this.wallet.creditWallet(
            userId,
            Number(order.sellingPriceNgn),
            `Refund for timed-out ${order.service}`,
            undefined,
            tx,
          );

          await tx.order.update({
            where: { id: order.id },
            data: {
              status,
              refundedAt: new Date(),
            },
          });
        });

        this.logger.log(
          `Auto-refunded order ${order.id} (status=${status}) — ₦${order.sellingPriceNgn} returned to user ${userId}.`,
        );
      } catch (err) {
        this.logger.error(
          `Refund failed for order ${order.id} on status=${status}: ${
            err instanceof Error
              ? err.message
              : String(err)
          }`,
        );

        await this.prisma.order.update({
          where: { id: order.id },
          data: { status },
        });
      }
    } else {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status },
      });
    }

    return {
      ...checked.raw,
      mappedStatus: status,
      refunded: shouldRefund,
    };
  }

  /* ============================================================
                              SMS
  ============================================================ */

  async sms(
    userId: string,
    orderId: string,
  ) {
    const order = await this.getOrder(userId, orderId);
    const checked = await this.checkProviderOrder(order);

    return {
      Data:
        checked.sms && checked.sms.length > 0
          ? checked.sms
          : null,
      Total: checked.sms?.length ?? 0,
    };
  }

  /* ============================================================
                            FINISH
  ============================================================ */

  async finish(
    userId: string,
    orderId: string,
  ) {
    const order = await this.getOrder(userId, orderId);

    if (order.provider === 'GRIZZYSMS') {
      await this.grizzySms.finish(
        order.providerOrderId ?? '',
      );
    } else if (order.provider === 'SMSBOWER') {
      await this.smsBower.finish(
        order.providerOrderId ?? '',
      );
    } else {
      await this.fiveSim.finish(
        Number(order.providerOrderId),
      );
    }

    await this.prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.COMPLETED },
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
    const order = await this.getOrder(userId, orderId);

    if (
      order.status === OrderStatus.CANCELLED ||
      order.status === OrderStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Order has already been processed.',
      );
    }

    let status: OrderStatus;
    let rawStatusLabel: string;

    if (order.provider === 'GRIZZYSMS') {
      const code = await this.grizzySms.cancel(
        order.providerOrderId ?? '',
      );

      status = this.mapGrizzyStatus(
        code === 'ACCESS_CANCEL'
          ? 'STATUS_CANCEL'
          : undefined,
      );

      rawStatusLabel = code;
    } else if (order.provider === 'SMSBOWER') {
      // SmsBowerService.cancel() returns an object, not a string.
      const result = await this.smsBower.cancel(
        order.providerOrderId ?? '',
      );

      status = this.mapGrizzyStatus(
        result.code === 'ACCESS_CANCEL'
          ? 'STATUS_CANCEL'
          : undefined,
      );

      rawStatusLabel = result.raw;
    } else {
      const provider = await this.fiveSim.cancel(
        Number(order.providerOrderId),
      );

      status = this.mapProviderStatus(
        (provider as any)?.status,
      );

      rawStatusLabel =
        (provider as any)?.status?.toUpperCase?.() ??
        'UNKNOWN';
    }

    const shouldRefund =
      (
        status === OrderStatus.CANCELLED ||
        status === OrderStatus.TIMEOUT
      ) &&
      order.refundedAt === null;

    if (shouldRefund) {
      try {
        await this.prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: {
              status,
              refundedAt: new Date(),
            },
          });

          await this.wallet.creditWallet(
            userId,
            Number(order.sellingPriceNgn),
            status === OrderStatus.TIMEOUT
              ? `Refund for timed-out ${order.service}`
              : `Refund for cancelled ${order.service}`,
            undefined,
            tx,
          );
        });
      } catch (err) {
        this.logger.error(
          `Cancel refund failed for order ${order.id}: ${
            err instanceof Error
              ? err.message
              : String(err)
          }`,
        );

        throw err;
      }
    } else {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status },
      });
    }

    return {
      success: true,
      providerStatus: rawStatusLabel,
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
    const order = await this.getOrder(userId, orderId);

    if (
      order.status === OrderStatus.CANCELLED ||
      order.status === OrderStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Order has already been processed.',
      );
    }

    if (order.provider === 'GRIZZYSMS') {
      await this.grizzySms.cancel(
        order.providerOrderId ?? '',
      );
    } else if (order.provider === 'SMSBOWER') {
      await this.smsBower.cancel(
        order.providerOrderId ?? '',
      );
    } else {
      await this.fiveSim.ban(
        Number(order.providerOrderId),
      );
    }

    await this.prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.BANNED },
    });

    return {
      success: true,
      message: 'Number banned successfully.',
    };
  }
}