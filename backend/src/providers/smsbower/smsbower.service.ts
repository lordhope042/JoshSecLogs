
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

    if (
      parsed === null ||
      typeof parsed !== 'object' ||
      Array.isArray(parsed)
    ) {
      throw new BadGatewayException(
        'SMSBower returned an invalid price catalogue',
      );
    }

    return parsed as SmsBowerPriceResponse;
  }

  /**
   * Retrieve prices using SMSBower's getPricesV2 action.
   */
  async getPricesV2(
    service?: string,
    country?: string,
  ): Promise<unknown> {
    const raw = await this.request({
      action: 'getPricesV2',
      service,
      country,
    });

    return this.parseJson<unknown>(raw, 'getPricesV2');
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

  async getCountriesList(): Promise<SmsBowerCountry[]> {
    if (
      this.countriesCache &&
      this.countriesCache.expiresAt > Date.now()
    ) {
      return this.countriesCache.data;
    }

    const raw = await this.request({
      action: 'getCountries',
    });

    const parsed = this.parseJson<unknown>(raw, 'getCountries');

    let items: unknown[] = [];

    if (Array.isArray(parsed)) {
      items = parsed;
    } else if (
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed)
    ) {
      const object = parsed as Record<string, unknown>;

      if (Array.isArray(object.countries)) {
        items = object.countries;
      } else if (Array.isArray(object.data)) {
        items = object.data;
      } else {
        items = Object.entries(object).map(([id, value]) => {
          if (value && typeof value === 'object') {
            return { id, ...(value as Record<string, unknown>) };
          }

          return { id, name: value };
        });
      }
    }

    const countries: SmsBowerCountry[] = items
      .map((item) => {
        if (!item || typeof item !== 'object') {
          return null;
        }

        const country = item as Record<string, unknown>;

        const id =
          country.id ??
          country.country ??
          country.countryId ??
          country.country_id;

        const name =
          country.name ??
          country.countryName ??
          country.country_name ??
          country.title;

        if (id === undefined || name === undefined) {
          return null;
        }

        return {
          id: String(id),
          name: String(name),
        };
      })
      .filter(
        (country): country is SmsBowerCountry => country !== null,
      );

    this.countriesCache = {
      data: countries,
      expiresAt: Date.now() + this.CACHE_TTL_MS,
    };

    return countries;
  }

  /* ------------------------------------------------------------------------ */
  /*                              SERVICE CATALOGUE                           */
  /* ------------------------------------------------------------------------ */

  async getServicesList(): Promise<SmsBowerServiceItem[]> {
    if (
      this.servicesCache &&
      this.servicesCache.expiresAt > Date.now()
    ) {
      return this.servicesCache.data;
    }

    const raw = await this.request({
      action: 'getServicesList',
    });

    const parsed = this.parseJson<unknown>(raw, 'getServicesList');

    let items: unknown[] = [];

    if (Array.isArray(parsed)) {
      items = parsed;
    } else if (
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed)
    ) {
      const object = parsed as Record<string, unknown>;

      if (Array.isArray(object.services)) {
        items = object.services;
      } else if (Array.isArray(object.data)) {
        items = object.data;
      } else {
        items = Object.entries(object).map(([code, value]) => {
          if (value && typeof value === 'object') {
            return {
              code,
              ...(value as Record<string, unknown>),
            };
          }

          return {
            code,
            name: value,
          };
        });
      }
    }

    const services: SmsBowerServiceItem[] = items
      .map((item) => {
        if (!item || typeof item !== 'object') {
          return null;
        }

        const service = item as Record<string, unknown>;

        const code =
          service.code ??
          service.service ??
          service.serviceCode ??
          service.service_code;

        const name =
          service.name ??
          service.serviceName ??
          service.service_name ??
          service.title;

        if (code === undefined || name === undefined) {
          return null;
        }

        return {
          code: String(code),
          name: String(name),
        };
      })
      .filter(
        (service): service is SmsBowerServiceItem =>
          service !== null,
      );

    this.servicesCache = {
      data: services,
      expiresAt: Date.now() + this.CACHE_TTL_MS,
    };

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

    if (
      !parsed ||
      typeof parsed !== 'object' ||
      Array.isArray(parsed)
    ) {
      throw new BadGatewayException(
        'SMSBower returned an unexpected number allocation response',
      );
    }

    const result = parsed as Record<string, unknown>;

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
   * Check catalogue pricing and stock.
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
    }>;
    available: boolean;
  }> {
    const prices = await this.getWhatsAppPrices(country);

    const countries = Object.entries(prices)
      .map(([countryId, services]) => {
        const whatsapp = services?.wa;

        if (!whatsapp) {
          return null;
        }

        const cost = Number(whatsapp.cost);
        const count = Number(whatsapp.count);

        return {
          countryId,
          cost: Number.isFinite(cost) ? cost : 0,
          count: Number.isFinite(count) ? count : 0,
          available:
            Number.isFinite(count) && count > 0,
        };
      })
      .filter(
        (
          item,
        ): item is {
          countryId: string;
          cost: number;
          count: number;
          available: boolean;
        } => item !== null,
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
      const services = await this.getServicesList();

      result.servicesCount = services.length;
      result.whatsappService = services.find(
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
      const countries = await this.getCountriesList();

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