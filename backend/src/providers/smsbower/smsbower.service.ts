import {
  BadGatewayException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export interface SmsBowerBuyResponse {
  id: string;
  phone: string;
  activationCost?: number;
  countryCode?: string;
  canGetAnotherSms?: boolean;
  activationTime?: string;
  activationOperator?: string;
}

export interface SmsBowerBuyV2Options {
  maxPrice?: number;
  minPrice?: number;
  providerIds?: string;
  exceptProviderIds?: string;
  userID?: string;
}

export interface SmsBowerStatusResponse {
  raw: string;
  code: string;
  value?: string;
}

export interface SmsBowerPrice {
  cost: number;
  count: number;
}

export interface SmsBowerPriceResponse {
  [countryId: string]: {
    [serviceCode: string]: SmsBowerPrice;
  };
}

/** One price tier from getPricesV2: the price and how many numbers sit at it. */
export interface SmsBowerPriceTier {
  price: number;
  count: number;
}

export interface SmsBowerServiceItem {
  code: string;
  name: string;
}

export interface SmsBowerCountry {
  id: string;
  name: string;
}

/**
 * SMSBower country identifiers.
 *
 * Verify these identifiers against your current SMSBower account catalogue
 * before purchasing numbers. Availability and supported number types can vary.
 */
export const SMSBOWER_USA_COUNTRIES = {
  PHYSICAL: '187',
  VIRTUAL: '12',
} as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/* -------------------------------------------------------------------------- */
/*                              SERVICE IMPLEMENTATION                        */
/* -------------------------------------------------------------------------- */

@Injectable()
export class SmsBowerService {
  private readonly logger = new Logger(SmsBowerService.name);

  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly BUY_TIMEOUT_MS = 60_000;
  private readonly DEFAULT_TIMEOUT_MS = 20_000;
  private readonly CACHE_TTL_MS = 60 * 60 * 1000;

  private countriesCache?: {
    data: SmsBowerCountry[];
    expiresAt: number;
  };

  private servicesCache?: {
    data: SmsBowerServiceItem[];
    expiresAt: number;
  };

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = (
      this.configService.get<string>(
        'SMSBOWER_BASE_URL',
        'https://smsbower.page/stubs/handler_api.php',
      ) || 'https://smsbower.page/stubs/handler_api.php'
    ).replace(/\/+$/, '');

    this.apiKey =
      this.configService.get<string>('SMSBOWER_API_KEY') || '';
  }

  /* ------------------------------------------------------------------------ */
  /*                              CONFIGURATION                               */
  /* ------------------------------------------------------------------------ */

  private ensureConfigured(): void {
    if (!this.apiKey) {
      throw new BadGatewayException(
        'SMSBower API key is not configured on the server',
      );
    }
  }

  /** Drop cached catalogues so the next call hits SMSBower again. */
  clearCache(): void {
    this.countriesCache = undefined;
    this.servicesCache = undefined;
  }

  /**
   * Make a request to SMSBower.
   *
   * The API key is never written to the logs.
   */
  private async request(
    params: Record<
      string,
      string | number | boolean | undefined | null
    >,
    timeout = this.DEFAULT_TIMEOUT_MS,
  ): Promise<string> {
    this.ensureConfigured();

    const query = new URLSearchParams();
    query.set('api_key', this.apiKey);

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, String(value));
      }
    }

    const url = `${this.baseUrl}?${query.toString()}`;

    const safeUrl = `${this.baseUrl}?api_key=[REDACTED]&${Array.from(
      query.entries(),
    )
      .filter(([key]) => key !== 'api_key')
      .map(([key, value]) => `${key}=${value}`)
      .join('&')}`;

    try {
      const response = await firstValueFrom(
        this.httpService.get<string>(url, {
          timeout,
          responseType: 'text',
          transformResponse: [(data) => data],
        }),
      );

      const raw =
        typeof response.data === 'string'
          ? response.data.trim()
          : JSON.stringify(response.data);

      this.logger.debug(`SMSBower request: ${safeUrl}`);
      this.logger.debug(
        `SMSBower response: ${raw.slice(0, 1000)}`,
      );

      return raw;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;

      const status = axiosError.response?.status;
      const responseData = axiosError.response?.data;

      const responseText =
        typeof responseData === 'string'
          ? responseData
          : responseData
            ? JSON.stringify(responseData)
            : undefined;

      this.logger.error(
        `SMSBower request failed. HTTP status: ${status ?? 'unknown'}. ` +
          `Message: ${axiosError.message || 'Unknown error'}`,
      );

      if (responseText) {
        this.logger.error(
          `SMSBower error response: ${responseText.slice(0, 500)}`,
        );
      }

      throw new BadGatewayException(
        'Unable to communicate with SMSBower. Check the provider status and server logs.',
      );
    }
  }

  /**
   * Parse JSON returned by SMSBower.
   */
  private parseJson<T>(raw: string, action: string): T {
    try {
      return JSON.parse(raw) as T;
    } catch {
      throw new BadGatewayException(
        `SMSBower returned an unexpected response for ${action}: ${raw.slice(0, 250)}`,
      );
    }
  }

  /**
   * Turn the different list shapes SMSBower can return into a flat array of
   * records. Handles:
   *   [ {...}, {...} ]
   *   { countries: [...] } / { services: [...] } / { data: [...] }
   *   { "1": {...}, "2": {...} }   (keyed by id/code)
   *   { "1": "Name" }              (keyed, value is the name)
   */
  private extractItems(
    parsed: unknown,
    listKeys: string[],
    keyField: string,
  ): Record<string, unknown>[] {
    if (Array.isArray(parsed)) {
      return parsed.filter(isRecord);
    }

    if (!isRecord(parsed)) {
      return [];
    }

    for (const listKey of listKeys) {
      const candidate = parsed[listKey];

      if (Array.isArray(candidate)) {
        return candidate.filter(isRecord);
      }
    }

    return Object.entries(parsed).map(([key, value]) =>
      isRecord(value)
        ? { [keyField]: key, ...value }
        : { [keyField]: key, name: value },
    );
  }

  /* ------------------------------------------------------------------------ */
  /*                                  BALANCE                                 */
  /* ------------------------------------------------------------------------ */

  async getBalance(): Promise<number> {
    const raw = await this.request({
      action: 'getBalance',
    });

    const match = raw.match(/ACCESS_BALANCE:([-+]?\d*\.?\d+)/i);

    if (!match) {
      throw new BadGatewayException(
        `Could not read SMSBower balance: ${raw.slice(0, 250)}`,
      );
    }

    return Number(match[1]);
  }

  /* ------------------------------------------------------------------------ */
  /*                               PRICE CATALOGUE                            */
  /* ------------------------------------------------------------------------ */

  /**
   * Retrieve prices using SMSBower's getPrices action.
   * Shape: { [countryId]: { [service]: { cost, count } } }
   */
  async getPrices(
    service?: string,
    country?: string,
  ): Promise<SmsBowerPriceResponse> {
    const raw = await this.request({
      action: 'getPrices',
      service,
      country,
    });

    const parsed = this.parseJson<unknown>(raw, 'getPrices');

    if (!isRecord(parsed)) {
      throw new BadGatewayException(
        'SMSBower returned an invalid price catalogue',
      );
    }

    return parsed as unknown as SmsBowerPriceResponse;
  }

  /**
   * Retrieve prices using SMSBower's getPricesV2 action.
   * Shape: { [countryId]: { [service]: { [price]: count } } }
   */
  async getPricesV2(
    service?: string,
    country?: string,
  ): Promise<Record<string, Record<string, unknown>>> {
    const raw = await this.request({
      action: 'getPricesV2',
      service,
      country,
    });

    const parsed = this.parseJson<unknown>(raw, 'getPricesV2');

    if (!isRecord(parsed)) {
      throw new BadGatewayException(
        `SMSBower returned an invalid V2 price catalogue: ${raw.slice(0, 250)}`,
      );
    }

    return parsed as Record<string, Record<string, unknown>>;
  }

  /**
   * Normalised V2 prices for one service: { [countryId]: tiers sorted by price }.
   * Countries with no readable tiers are left out.
   */
  async getServicePriceTiers(
    service: string,
    country?: string,
  ): Promise<Record<string, SmsBowerPriceTier[]>> {
    const data = await this.getPricesV2(service, country);
    const result: Record<string, SmsBowerPriceTier[]> = {};

    for (const [countryId, services] of Object.entries(data)) {
      const entry = isRecord(services) ? services[service] : undefined;

      if (!isRecord(entry)) {
        continue;
      }

      const tiers = Object.entries(entry)
        .map(([price, value]) => ({
          price: Number(price),
          count: isRecord(value) ? Number(value.count) : Number(value),
        }))
        .filter(
          (tier) =>
            Number.isFinite(tier.price) && Number.isFinite(tier.count),
        )
        .sort((a, b) => a.price - b.price);

      if (tiers.length > 0) {
        result[countryId] = tiers;
      }
    }

    return result;
  }

  /**
   * Return WhatsApp prices, optionally restricted to a country.
   */
  async getWhatsAppPrices(
    country?: string,
  ): Promise<SmsBowerPriceResponse> {
    return this.getPrices('wa', country);
  }

  /* ------------------------------------------------------------------------ */
  /*                              COUNTRY CATALOGUE                           */
  /* ------------------------------------------------------------------------ */

  async getCountriesList(forceRefresh = false): Promise<SmsBowerCountry[]> {
    if (
      !forceRefresh &&
      this.countriesCache &&
      this.countriesCache.expiresAt > Date.now()
    ) {
      return this.countriesCache.data;
    }

    const raw = await this.request({
      action: 'getCountries',
    });

    const parsed = this.parseJson<unknown>(raw, 'getCountries');

    const items = this.extractItems(
      parsed,
      ['countries', 'data'],
      'id',
    );

    const countries: SmsBowerCountry[] = [];

    for (const country of items) {
      const id =
        country.id ??
        country.country ??
        country.countryId ??
        country.country_id;

      if (id === undefined || id === null || String(id) === '') {
        continue;
      }

      // SMSBower returns names as { rus, eng, chn }. Prefer English, and never
      // drop a country just because its name field is missing.
      const name =
        country.eng ??
        country.name ??
        country.countryName ??
        country.country_name ??
        country.title ??
        country.rus ??
        country.chn;

      countries.push({
        id: String(id),
        name:
          name !== undefined && name !== null && String(name) !== ''
            ? String(name)
            : String(id),
      });
    }

    if (countries.length < items.length) {
      this.logger.warn(
        `SMSBower getCountries: kept ${countries.length} of ${items.length} items. ` +
          `Sample: ${JSON.stringify(items[0]).slice(0, 300)}`,
      );
    }

    // Never cache an empty result, otherwise a parse problem sticks for an hour.
    if (countries.length > 0) {
      this.countriesCache = {
        data: countries,
        expiresAt: Date.now() + this.CACHE_TTL_MS,
      };
    }

    return countries;
  }

  /* ------------------------------------------------------------------------ */
  /*                              SERVICE CATALOGUE                           */
  /* ------------------------------------------------------------------------ */

  async getServicesList(forceRefresh = false): Promise<SmsBowerServiceItem[]> {
    if (
      !forceRefresh &&
      this.servicesCache &&
      this.servicesCache.expiresAt > Date.now()
    ) {
      return this.servicesCache.data;
    }

    const raw = await this.request({
      action: 'getServicesList',
    });

    const parsed = this.parseJson<unknown>(raw, 'getServicesList');

    const items = this.extractItems(
      parsed,
      ['services', 'data'],
      'code',
    );

    const services: SmsBowerServiceItem[] = [];

    for (const service of items) {
      const code =
        service.code ??
        service.service ??
        service.serviceCode ??
        service.service_code;

      if (code === undefined || code === null || String(code) === '') {
        continue;
      }

      // Fall back to the code instead of dropping a service with no name field.
      const name =
        service.name ??
        service.serviceName ??
        service.service_name ??
        service.title ??
        service.eng ??
        service.rus;

      services.push({
        code: String(code),
        name:
          name !== undefined && name !== null && String(name) !== ''
            ? String(name)
            : String(code),
      });
    }

    if (services.length < items.length) {
      this.logger.warn(
        `SMSBower getServicesList: kept ${services.length} of ${items.length} items. ` +
          `Sample: ${JSON.stringify(items[0]).slice(0, 300)}`,
      );
    }

    if (services.length > 0) {
      this.servicesCache = {
        data: services,
        expiresAt: Date.now() + this.CACHE_TTL_MS,
      };
    }

    return services;
  }

  /* ------------------------------------------------------------------------ */
  /*                           NUMBER ALLOCATION V2                           */
  /* ------------------------------------------------------------------------ */

  /**
   * Allocate a number through SMSBower's getNumberV2 endpoint.
   *
   * The provider returns JSON containing activationId and phoneNumber.
   */
  async buyV2(
    service: string,
    country: string,
    options: SmsBowerBuyV2Options = {},
  ): Promise<SmsBowerBuyResponse> {
    if (!service || !country) {
      throw new BadGatewayException(
        'A service code and country ID are required',
      );
    }

    const raw = await this.request(
      {
        action: 'getNumberV2',
        service,
        country,
        maxPrice: options.maxPrice,
        minPrice: options.minPrice,
        providerIds: options.providerIds,
        exceptProviderIds: options.exceptProviderIds,
        userID: options.userID,
      },
      this.BUY_TIMEOUT_MS,
    );

    let parsed: unknown;

    try {
      parsed = JSON.parse(raw);
    } catch {
      this.logger.warn(
        `SMSBower getNumberV2 returned a non-JSON response: ${raw.slice(0, 300)}`,
      );

      throw new BadGatewayException(
        `SMSBower getNumberV2 returned a non-JSON response: ${raw.slice(0, 250)}`,
      );
    }

    if (!isRecord(parsed)) {
      throw new BadGatewayException(
        'SMSBower returned an unexpected number allocation response',
      );
    }

    const result = parsed;

    const activationId = result.activationId;
    const phoneNumber = result.phoneNumber;

    if (
      activationId === undefined ||
      activationId === null ||
      phoneNumber === undefined ||
      phoneNumber === null ||
      String(phoneNumber).trim() === ''
    ) {
      const providerMessage =
        result.message ??
        result.error ??
        result.status ??
        'No number was allocated';

      this.logger.warn(
        `SMSBower number allocation unsuccessful: ${String(providerMessage).slice(0, 300)}`,
      );

      throw new BadGatewayException(
        `SMSBower could not allocate a number: ${String(providerMessage).slice(0, 250)}`,
      );
    }

    let canGetAnotherSms: boolean | undefined;

    if (typeof result.canGetAnotherSms === 'boolean') {
      canGetAnotherSms = result.canGetAnotherSms;
    } else if (typeof result.canGetAnotherSms === 'string') {
      canGetAnotherSms =
        result.canGetAnotherSms.toLowerCase() === 'true';
    }

    return {
      id: String(activationId),
      phone: String(phoneNumber),
      activationCost:
        result.activationCost !== undefined &&
        result.activationCost !== null
          ? Number(result.activationCost)
          : undefined,
      countryCode:
        result.countryCode !== undefined &&
        result.countryCode !== null
          ? String(result.countryCode)
          : undefined,
      canGetAnotherSms,
      activationTime:
        result.activationTime !== undefined &&
        result.activationTime !== null
          ? String(result.activationTime)
          : undefined,
      activationOperator:
        result.activationOperator !== undefined &&
        result.activationOperator !== null
          ? String(result.activationOperator)
          : undefined,
    };
  }

  /**
   * Backwards-compatible method for existing callers.
   * Existing callers can continue using buy(service, country, maxPrice).
   */
  async buy(
    service: string,
    country: string,
    maxPrice?: number,
  ): Promise<SmsBowerBuyResponse> {
    return this.buyV2(service, country, { maxPrice });
  }

  /**
   * Allocate a WhatsApp number.
   */
  async buyWhatsApp(
    country: string,
    maxPrice?: number,
  ): Promise<SmsBowerBuyResponse> {
    return this.buyV2('wa', country, { maxPrice });
  }

  /* ------------------------------------------------------------------------ */
  /*                            ACTIVATION STATUS                             */
  /* ------------------------------------------------------------------------ */

  /**
   * Change the status of an activation.
   *
   * Common SMSBower status values:
   * 1 = request another SMS
   * 3 = request SMS activation completion
   * 6 = finish activation
   * 8 = cancel activation
   */
  async setStatus(
    id: string,
    status: 1 | 3 | 6 | 8,
  ): Promise<SmsBowerStatusResponse> {
    const raw = await this.request({
      action: 'setStatus',
      id,
      status,
    });

    const parts = raw.split(':');

    return {
      raw,
      code: parts[0] || raw,
      value: parts.length > 1 ? parts.slice(1).join(':') : undefined,
    };
  }

  async finish(id: string): Promise<SmsBowerStatusResponse> {
    return this.setStatus(id, 6);
  }

  async cancel(id: string): Promise<SmsBowerStatusResponse> {
    return this.setStatus(id, 8);
  }

  /**
   * Check an activation's current status.
   */
  async getStatus(id: string): Promise<SmsBowerStatusResponse> {
    const raw = await this.request({
      action: 'getStatus',
      id,
    });

    const parts = raw.split(':');

    return {
      raw,
      code: parts[0] || raw,
      value: parts.length > 1 ? parts.slice(1).join(':') : undefined,
    };
  }

  /* ------------------------------------------------------------------------ */
  /*                          WHATSAPP AVAILABILITY                            */
  /* ------------------------------------------------------------------------ */

  /**
   * Check catalogue pricing and stock using getPricesV2, which lists every
   * price tier (the v1 call can show only one price per country).
   *
   * `cost` is the cheapest tier that has stock, `count` is total stock across
   * all tiers, and `tiers` has the full breakdown.
   *
   * This is an estimate of catalogue availability, not a guarantee that
   * a subsequent number purchase will succeed.
   */
  async checkWhatsAppAvailability(
    country?: string,
  ): Promise<{
    service: string;
    country?: string;
    countries: Array<{
      countryId: string;
      cost: number;
      count: number;
      available: boolean;
      tiers: SmsBowerPriceTier[];
    }>;
    available: boolean;
  }> {
    const tiersByCountry = await this.getServicePriceTiers('wa', country);

    const countries = Object.entries(tiersByCountry).map(
      ([countryId, tiers]) => {
        const inStock = tiers.filter((tier) => tier.count > 0);
        const count = tiers.reduce((sum, tier) => sum + tier.count, 0);

        return {
          countryId,
          cost: (inStock[0] ?? tiers[0]).price,
          count,
          available: inStock.length > 0,
          tiers,
        };
      },
    );

    return {
      service: 'wa',
      country,
      countries,
      available: countries.some((item) => item.available),
    };
  }

  /* ------------------------------------------------------------------------ */
  /*                                  PING                                    */
  /* ------------------------------------------------------------------------ */

  async ping(): Promise<{
    provider: string;
    status: 'online' | 'offline';
    balance?: number;
    baseUrl: string;
    error?: string;
  }> {
    try {
      const balance = await this.getBalance();

      return {
        provider: 'SMSBower',
        status: 'online',
        balance,
        baseUrl: this.baseUrl,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown error';

      return {
        provider: 'SMSBower',
        status: 'offline',
        baseUrl: this.baseUrl,
        error: message,
      };
    }
  }

  /* ------------------------------------------------------------------------ */
  /*                               DIAGNOSTICS                                */
  /* ------------------------------------------------------------------------ */

  async diagnostics(): Promise<Record<string, unknown>> {
    const result: Record<string, unknown> = {
      provider: 'SMSBower',
      baseUrl: this.baseUrl,
      configured: Boolean(this.apiKey),
      whatsappServiceCode: 'wa',
    };

    if (!this.apiKey) {
      return {
        ...result,
        status: 'not_configured',
        error: 'SMSBOWER_API_KEY is missing',
      };
    }

    try {
      result.balance = await this.getBalance();
      result.balanceStatus = 'success';
    } catch (error: unknown) {
      result.balanceStatus = 'failed';
      result.balanceError =
        error instanceof Error ? error.message : 'Unknown error';
    }

    try {
      const services = await this.getServicesList(true);

      result.servicesCount = services.length;
      result.whatsappService =
        services.find(
          (service) =>
            service.code.toLowerCase() === 'wa' ||
            service.name.toLowerCase().includes('whatsapp'),
        ) ?? null;
    } catch (error: unknown) {
      result.servicesStatus = 'failed';
      result.servicesError =
        error instanceof Error ? error.message : 'Unknown error';
    }

    try {
      result.whatsappPrices = await this.getPrices('wa');
      result.whatsappPricesStatus = 'success';
    } catch (error: unknown) {
      result.whatsappPricesStatus = 'failed';
      result.whatsappPricesError =
        error instanceof Error ? error.message : 'Unknown error';
    }

    try {
      result.whatsappPricesV2 = await this.getServicePriceTiers('wa');
      result.whatsappPricesV2Status = 'success';
    } catch (error: unknown) {
      result.whatsappPricesV2Status = 'failed';
      result.whatsappPricesV2Error =
        error instanceof Error ? error.message : 'Unknown error';
    }

    try {
      const countries = await this.getCountriesList(true);

      result.countriesCount = countries.length;
      result.usaCountries = countries.filter((country) =>
        country.name.toLowerCase().includes('united states'),
      );
    } catch (error: unknown) {
      result.countriesStatus = 'failed';
      result.countriesError =
        error instanceof Error ? error.message : 'Unknown error';
    }

    return result;
  }
}