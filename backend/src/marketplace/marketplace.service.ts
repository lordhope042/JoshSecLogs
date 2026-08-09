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
import { OrderStatus } from '@prisma/client';

import { BuyNumberDto } from './dto/buy-number.dto';

type Provider = 'FIVESIM' | 'GRIZZYSMS';

@Injectable()
export class MarketplaceService {
  private readonly logger = new Logger(
    MarketplaceService.name,
  );

  constructor(
    private readonly fiveSim: FiveSimService,
    private readonly grizzySms: GrizzySmsService,
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

  // GrizzySMS (handler_api.php / SMS-Activate protocol) — confirmed
  // 2026-08-09 that this account is priced and billed in USD, not RUB
  // (some handler_api.php resellers default to RUB, but not this one).
  // Uses the same usdRate/markup as 5sim — kept as a separate named
  // method (rather than reusing convertPrice directly) so the call
  // site in grizzyPrices() stays self-documenting about which
  // provider's price it's converting.
  private convertUsdPriceGrizzy(
    usd: number,
  ): number {
    return Math.ceil(
      usd * this.usdRate * this.markup,
    );
  }

  /* ============================================================
              GRIZZYSMS NAME LOOKUP (live, not hardcoded)
  ============================================================
  Names come from GrizzySMS's own getCountries/getServices actions
  (GrizzySmsService.getCountriesList/getServicesList), cached for an
  hour. If those actions aren't available on this account/API version,
  they return null and we fall back to the raw id/code as the display
  name — never a guessed or hardcoded translation.
  ============================================================ */

  /* ============================================================
                        COUNTRIES
  ============================================================ */

  async countries(provider: Provider = 'FIVESIM') {
    if (provider === 'GRIZZYSMS') {
      return this.grizzyCountries();
    }
    return this.fiveSimCountries();
  }

  private async fiveSimCountries() {
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

  private async grizzyCountries() {
    try {
      const [prices, namedList] = await Promise.all([
        this.grizzySms.getPricesV2(),
        this.grizzySms.getCountriesList(),
      ]);

      const nameMap = new Map(
        (namedList ?? []).map((c) => [c.id, c.name]),
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

  /**
   * Resolves a country name/slug (e.g. "bangladesh", from the URL) to
   * GrizzySMS's numeric country ID (e.g. "60"), using the live
   * getCountriesList() lookup. If the caller already passed a numeric
   * ID, it's returned as-is — no wasted lookup.
   */
  private async resolveGrizzyCountryId(country: string): Promise<string> {
    // Already numeric — nothing to resolve.
    if (/^\d+$/.test(country)) {
      return country;
    }

    const list = await this.grizzySms.getCountriesList();

    if (!list) {
      throw new BadGatewayException(
        'Unable to resolve country — GrizzySMS country list unavailable.',
      );
    }

    const match = list.find(
      (c) => c.name.toLowerCase() === country.toLowerCase(),
    );

    if (!match) {
      throw new BadRequestException(
        `Unknown country "${country}" for GrizzySMS.`,
      );
    }

    return match.id;
  }

  /* ============================================================
                        PRODUCTS
  ============================================================ */

  async products(country: string, provider: Provider = 'FIVESIM') {
    if (provider === 'GRIZZYSMS') {
      return this.grizzyProducts(country);
    }
    return this.fiveSimProducts(country);
  }

  private async fiveSimProducts(country: string) {
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

  private async grizzyProducts(country: string) {
    try {
      const countryId = await this.resolveGrizzyCountryId(country);

      const [prices, namedList] = await Promise.all([
        this.grizzySms.getPricesV2(undefined, countryId),
        this.grizzySms.getServicesList(),
      ]);

      const nameMap = new Map(
        (namedList ?? []).map((s) => [s.code, s.name]),
      );

      const services = prices?.[countryId] ?? {};

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

  /* ============================================================
                          PRICES
  ============================================================ */

  async prices(country: string, provider: Provider = 'FIVESIM') {
    if (provider === 'GRIZZYSMS') {
      return this.grizzyPrices(country);
    }
    return this.fiveSimPrices(country);
  }

  private async fiveSimPrices(country: string) {
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

  /**
   * GrizzySMS (handler_api.php protocol) has no per-operator breakdown
   * the way 5sim does — each service+country combo is a single price
   * and stock count. To keep the response shape identical for the
   * frontend, a single synthetic activationType of "any" is returned
   * per service.
   */
  private async grizzyPrices(country: string) {
    try {
      const countryId = await this.resolveGrizzyCountryId(country);

      const [response, namedList] = await Promise.all([
        this.grizzySms.getPricesV2(undefined, countryId),
        this.grizzySms.getServicesList(),
      ]);

      const nameMap = new Map(
        (namedList ?? []).map((s) => [s.code, s.name]),
      );

      const services = response?.[countryId] ?? {};

      // GrizzySMS returns each service as a map of
      // { [priceInUsd as string]: countAvailable } — MULTIPLE price
      // tiers per service, not a single {cost, count} object (that
      // was the wrong assumption before — it silently produced
      // stock: 0 for every service, since info.cost/info.count don't
      // exist on this shape). Pick the cheapest tier that actually
      // has stock available.
      //
      // NOTE: confirmed 2026-08-09 this account is priced in USD, not
      // RUB — see convertUsdPriceGrizzy() above.
      return Object.entries(services)
        .map(([service, tiers]: any) => {
          const best = Object.entries(tiers ?? {})
            .map(([priceStr, count]: any) => ({
              usd: Number(priceStr),
              stock: Number(count),
            }))
            .filter((t) => t.stock > 0 && t.usd > 0)
            .sort((a, b) => a.usd - b.usd)[0];

          if (!best) {
            return null;
          }

          return {
            service, // raw code (e.g. "wa") — still used for the buy call
            name: nameMap.get(service) ?? service, // friendly display name
            activationTypes: [
              {
                activationType: 'any',
                stock: best.stock,
                priceUsd: best.usd,
                priceNgn: this.convertUsdPriceGrizzy(best.usd),
              },
            ],
          };
        })
        .filter(
          (
            s,
          ): s is {
            service: string;
            name: string;
            activationTypes: any[];
          } => s !== null,
        )
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
    provider: Provider,
  ) {
    if (provider === 'GRIZZYSMS') {
      const countryId = await this.resolveGrizzyCountryId(country);
      const purchase = await this.grizzySms.buy(product, countryId);

      if (!purchase?.id) {
        throw new BadGatewayException(
          'Provider failed to allocate a number.',
        );
      }

      return purchase;
    }

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

        provider: dto.provider,

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

  /**
   * GrizzySMS (handler_api.php) getStatus raw codes:
   *   STATUS_WAIT_CODE   -> waiting for SMS, still active
   *   STATUS_WAIT_RETRY  -> waiting for SMS, still active
   *   STATUS_WAIT_RESEND -> waiting for SMS, still active
   *   STATUS_OK          -> SMS received
   *   STATUS_CANCEL      -> cancelled
   */
  private mapGrizzyStatus(rawCode: string | undefined): OrderStatus {
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
    if (order.provider === 'GRIZZYSMS') {
      const result = await this.grizzySms.getStatus(
        order.providerOrderId ?? '',
      );
      return {
        status: this.mapGrizzyStatus(result.code),
        sms: result.code === 'STATUS_OK' && result.value ? [result.value] : null,
        raw: result,
      };
    }

    const result = await this.fiveSim.check(Number(order.providerOrderId));
    return {
      status: this.mapProviderStatus((result as any)?.status),
      sms: result.sms,
      raw: result,
    };
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
        dto.provider,
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
          dto.provider,
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

    const checked = await this.checkProviderOrder(order);
    const status = checked.status;

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
      // FIX: wrap the wallet credit AND the order status/refundedAt update
      // in a SINGLE Prisma interactive transaction.  Previously these were
      // two independent writes — if the `order.update` threw after the
      // `wallet.credit` had already committed, the user's wallet was
      // credited but `refundedAt` stayed null, so a later sync would
      // credit them AGAIN (double refund).  Now both succeed or both
      // roll back together.
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
        // The whole transaction rolled back, so neither the credit nor
        // the order update was persisted.  Persist just the status so the
        // UI reflects reality, and log loudly so it can be reconciled
        // manually.  refundedAt remains null, so a later sync can retry.
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
      ...checked.raw,
      mappedStatus: status,
      refunded: shouldRefund,
    };
  }

  /* ============================================================
                        SMS
  ============================================================ */
  async sms(userId: string, orderId: string) {
    const order = await this.getOrder(userId, orderId);

    const checked = await this.checkProviderOrder(order);

    return {
      Data: checked.sms && checked.sms.length > 0 ? checked.sms : null,
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
    const order =
      await this.getOrder(
        userId,
        orderId,
      );

    if (order.provider === 'GRIZZYSMS') {
      await this.grizzySms.finish(order.providerOrderId ?? '');
    } else {
      await this.fiveSim.finish(
        Number(order.providerOrderId),
      );
    }

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

    let status: OrderStatus;
    let rawStatusLabel: string;

    if (order.provider === 'GRIZZYSMS') {
      const code = await this.grizzySms.cancel(order.providerOrderId ?? '');
      status = this.mapGrizzyStatus(
        code === 'ACCESS_CANCEL' ? 'STATUS_CANCEL' : undefined,
      );
      rawStatusLabel = code;
    } else {
      const provider = await this.fiveSim.cancel(
        Number(order.providerOrderId),
      );
      status = this.mapProviderStatus((provider as any)?.status);
      rawStatusLabel =
        (provider as any)?.status?.toUpperCase?.() ?? 'UNKNOWN';
    }

    // Refund on a genuine cancellation OR a timeout. A timeout means
    // the number expired without receiving an SMS — the user paid for
    // a number that delivered no value, so their wallet should be
    // restored. Guard with refundedAt so a second cancel/sync can't
    // double-refund.
    const shouldRefund =
      (status === OrderStatus.CANCELLED ||
        status === OrderStatus.TIMEOUT) &&
      order.refundedAt === null;

    if (shouldRefund) {
      // FIX: wrap the order status/refundedAt update AND the wallet credit
      // in a SINGLE Prisma interactive transaction.  Previously the code
      // first set `refundedAt` on the order, then credited the wallet as a
      // separate write — if the credit threw, a compensating rollback
      // (setting refundedAt back to null) was attempted, but that rollback
      // itself could fail, leaving the order marked as refunded with no
      // money returned.  Now both operations commit or roll back together,
      // so no compensating rollback is needed.
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
        // Transaction rolled back — neither the order update nor the
        // credit persisted, so refundedAt is still null and a later
        // sync/cancel can retry cleanly.
        this.logger.error(
          `Cancel refund failed for order ${order.id}: ${err instanceof Error ? err.message : String(err)}`,
        );
        throw err;
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

    if (order.provider === 'GRIZZYSMS') {
      // handler_api.php has no separate "ban" action — status 8 (cancel)
      // is the closest equivalent for marking a number bad/unusable.
      await this.grizzySms.cancel(order.providerOrderId ?? '');
    } else {
      await this.fiveSim.ban(
        Number(order.providerOrderId),
      );
    }

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