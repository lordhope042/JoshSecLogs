import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadGatewayException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

/*
|--------------------------------------------------------------------------
| SMSBOWER PROVIDER
|--------------------------------------------------------------------------
|
| SMSBower uses the classic handler_api.php protocol.
|
| Important service codes:
|   WhatsApp = wa
|   Telegram = tg
|   Facebook = fb
|   Instagram = ig
|   Google/Gmail/YouTube = go
|   TikTok = lf
|   Twitter = tw
|
| The API returns:
|
|   getBalance:
|     ACCESS_BALANCE:100.00
|
|   getNumber:
|     ACCESS_NUMBER:activationId:phoneNumber
|
|   getStatus:
|     STATUS_WAIT_CODE
|     STATUS_OK:123456
|
|   setStatus:
|     ACCESS_READY
|     ACCESS_RETRY_GET
|     ACCESS_ACTIVATION
|     ACCESS_CANCEL
|
|--------------------------------------------------------------------------
*/

export interface SmsBowerBuyResponse {
  id: string;
  phone: string;
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

@Injectable()
export class SmsBowerService {
  private readonly logger = new Logger(SmsBowerService.name);

  private countriesCache: {
    data: SmsBowerCountry[];
    expiresAt: number;
  } | null = null;

  private servicesCache: {
    data: SmsBowerServiceItem[];
    expiresAt: number;
  } | null = null;

  private readonly CACHE_TTL_MS = 60 * 60 * 1000;

  private readonly DEFAULT_TIMEOUT_MS = 15000;

  private readonly BUY_TIMEOUT_MS = 30000;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  /*
  |--------------------------------------------------------------------------
  | CONFIGURATION
  |--------------------------------------------------------------------------
  */

  private get apiKey(): string {
    const key = this.config.get<string>('SMSBOWER_API_KEY');

    if (!key) {
      throw new InternalServerErrorException(
        'Missing SMSBOWER_API_KEY',
      );
    }

    return key;
  }

  private get baseUrl(): string {
    const configured = this.config.get<string>(
      'SMSBOWER_BASE_URL',
    );

    /*
     * Official handler API endpoint.
     *
     * You can override this through:
     *
     * SMSBOWER_BASE_URL=https://smsbower.page/stubs/handler_api.php
     */

    if (!configured) {
      return 'https://smsbower.page/stubs/handler_api.php';
    }

    const trimmed = configured.replace(/\/+$/, '');

    if (trimmed.endsWith('/handler_api.php')) {
      return trimmed;
    }

    return `${trimmed}/stubs/handler_api.php`;
  }

  /*
  |--------------------------------------------------------------------------
  | GENERIC API REQUEST
  |--------------------------------------------------------------------------
  */

  private async request(
    params: Record<string, string | number | undefined>,
    timeoutMs: number = this.DEFAULT_TIMEOUT_MS,
  ): Promise<string> {
    try {
      const query = new URLSearchParams();

      query.set('api_key', this.apiKey);

      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          query.set(key, String(value));
        }
      }

      const url = `${this.baseUrl}?${query.toString()}`;

      this.logger.debug(
        `SMSBower request: ${this.safeUrlForLog(url)}`,
      );

      const { data } = await firstValueFrom(
        this.http.request<string>({
          method: 'GET',
          url,
          timeout: timeoutMs,
          responseType: 'text',

          transformResponse: (response) => response,
        }),
      );

      const result =
        typeof data === 'string'
          ? data
          : JSON.stringify(data);

      this.logger.debug(
        `SMSBower response: ${result.slice(0, 1000)}`,
      );

      return result;
    } catch (error) {
      const err = error as AxiosError;

      this.logger.error(`
========== SMSBOWER ERROR ==========
BASE URL: ${this.baseUrl}
PARAMS: ${JSON.stringify(params)}
TIMEOUT: ${timeoutMs}
STATUS: ${err.response?.status ?? 'N/A'}
RESPONSE: ${JSON.stringify(err.response?.data ?? '')}
MESSAGE: ${
        error instanceof Error
          ? error.message
          : String(error)
      }
====================================
      `);

      throw new BadGatewayException(
        'SMSBower request failed',
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | HIDE API KEY FROM LOGS
  |--------------------------------------------------------------------------
  */

  private safeUrlForLog(url: string): string {
    try {
      const parsed = new URL(url);

      if (parsed.searchParams.has('api_key')) {
        parsed.searchParams.set(
          'api_key',
          '********',
        );
      }

      return parsed.toString();
    } catch {
      return '[invalid-url]';
    }
  }

  /*
  |--------------------------------------------------------------------------
  | PARSE TEXT RESPONSE
  |--------------------------------------------------------------------------
  */

  private parseTextResponse(
    raw: string,
  ): SmsBowerStatusResponse {
    const trimmed = raw.trim();

    const [code, ...rest] = trimmed.split(':');

    return {
      raw: trimmed,
      code,
      value:
        rest.length > 0
          ? rest.join(':')
          : undefined,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | BALANCE
  |--------------------------------------------------------------------------
  */

  async getBalance(): Promise<number> {
    const raw = await this.request({
      action: 'getBalance',
    });

    const parsed = this.parseTextResponse(raw);

    if (parsed.code !== 'ACCESS_BALANCE') {
      throw new BadGatewayException(
        `Unexpected SMSBower balance response: ${parsed.raw}`,
      );
    }

    const balance = Number(parsed.value ?? 0);

    if (Number.isNaN(balance)) {
      throw new BadGatewayException(
        `Invalid SMSBower balance: ${parsed.raw}`,
      );
    }

    return balance;
  }

  /*
  |--------------------------------------------------------------------------
  | PRICES
  |--------------------------------------------------------------------------
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

    return this.parsePriceResponse(raw);
  }

  /*
  |--------------------------------------------------------------------------
  | PRICES V2
  |--------------------------------------------------------------------------
  */

  async getPricesV2(
    service?: string,
    country?: string,
  ): Promise<SmsBowerPriceResponse> {
    const raw = await this.request({
      action: 'getPricesV2',
      service,
      country,
    });

    return this.parsePriceResponse(raw);
  }

  /*
  |--------------------------------------------------------------------------
  | PARSE PRICE RESPONSE
  |--------------------------------------------------------------------------
  */

  private parsePriceResponse(
    raw: string,
  ): SmsBowerPriceResponse {
    try {
      const parsed = JSON.parse(raw);

      /*
       * Some providers return:
       *
       * {
       *   "0": {
       *     "wa": {
       *       "cost": 1.2,
       *       "count": 10
       *     }
       *   }
       * }
       *
       * Others may wrap it in:
       *
       * {
       *   "prices": {...}
       * }
       */

      if (
        parsed &&
        typeof parsed === 'object' &&
        parsed.prices &&
        typeof parsed.prices === 'object'
      ) {
        return parsed.prices;
      }

      return parsed;
    } catch {
      this.logger.error(
        `SMSBower returned invalid price JSON: ${raw.slice(
          0,
          1000,
        )}`,
      );

      throw new BadGatewayException(
        `SMSBower getPrices returned non-JSON: ${raw.slice(
          0,
          200,
        )}`,
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | COUNTRIES
  |--------------------------------------------------------------------------
  */

  async getCountriesList(): Promise<
    SmsBowerCountry[] | null
  > {
    if (
      this.countriesCache &&
      this.countriesCache.expiresAt > Date.now()
    ) {
      return this.countriesCache.data;
    }

    try {
      const raw = await this.request({
        action: 'getCountries',
      });

      this.logger.debug(
        `SMSBower countries raw response: ${raw.slice(
          0,
          1000,
        )}`,
      );

      const parsed = JSON.parse(raw);

      let result: SmsBowerCountry[] | null = null;

      /*
       * Array format
       */
      if (Array.isArray(parsed)) {
        result = parsed
          .map((entry: any) => ({
            id: String(
              entry.id ??
                entry.country ??
                entry.countryId ??
                '',
            ),

            name: String(
              entry.name_en ??
                entry.name ??
                entry.eng ??
                entry.countryName ??
                entry.id ??
                '',
            ),
          }))
          .filter((country) => country.id);
      }

      /*
       * Object format
       */
      else if (
        parsed &&
        typeof parsed === 'object'
      ) {
        const source =
          parsed.countries &&
          typeof parsed.countries === 'object'
            ? parsed.countries
            : parsed;

        result = Object.entries(source).map(
          ([id, value]: [string, any]) => ({
            id,

            name: String(
              value?.name_en ??
                value?.name ??
                value?.eng ??
                value?.countryName ??
                id,
            ),
          }),
        );
      }

      if (result) {
        this.countriesCache = {
          data: result,
          expiresAt:
            Date.now() + this.CACHE_TTL_MS,
        };
      }

      return result;
    } catch (error) {
      this.logger.warn(
        `Unable to load SMSBower countries: ${
          error instanceof Error
            ? error.message
            : String(error)
        }`,
      );

      return null;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | SERVICES
  |--------------------------------------------------------------------------
  */

  async getServicesList(): Promise<
    SmsBowerServiceItem[] | null
  > {
    if (
      this.servicesCache &&
      this.servicesCache.expiresAt > Date.now()
    ) {
      return this.servicesCache.data;
    }

    try {
      const raw = await this.request({
        action: 'getServicesList',
      });

      this.logger.debug(
        `SMSBower services raw response: ${raw.slice(
          0,
          2000,
        )}`,
      );

      const parsed = JSON.parse(raw);

      let list: any[] | null = null;

      /*
       * Possible response:
       *
       * [
       *   {
       *     code: "wa",
       *     name: "WhatsApp"
       *   }
       * ]
       */

      if (Array.isArray(parsed)) {
        list = parsed;
      }

      /*
       * Or:
       *
       * {
       *   services: [...]
       * }
       */

      else if (
        parsed &&
        Array.isArray(parsed.services)
      ) {
        list = parsed.services;
      }

      /*
       * Or object:
       *
       * {
       *   wa: "WhatsApp",
       *   tg: "Telegram"
       * }
       */

      if (list) {
        const result = list
          .map((entry: any) => ({
            code: String(
              entry.code ??
                entry.id ??
                entry.service ??
                '',
            ),

            name: String(
              entry.name ??
                entry.title ??
                entry.serviceName ??
                entry.code ??
                '',
            ),
          }))
          .filter((service) => service.code);

        this.servicesCache = {
          data: result,
          expiresAt:
            Date.now() + this.CACHE_TTL_MS,
        };

        return result;
      }

      /*
       * Object-format fallback.
       */

      if (
        parsed &&
        typeof parsed === 'object'
      ) {
        const source =
          parsed.services &&
          typeof parsed.services === 'object'
            ? parsed.services
            : parsed;

        const result = Object.entries(
          source,
        ).map(
          ([code, value]: [string, any]) => ({
            code,

            name: String(
              typeof value === 'string'
                ? value
                : value?.name ??
                  value?.title ??
                  code,
            ),
          }),
        );

        this.servicesCache = {
          data: result,
          expiresAt:
            Date.now() + this.CACHE_TTL_MS,
        };

        return result;
      }

      return null;
    } catch (error) {
      this.logger.warn(
        `Unable to load SMSBower services: ${
          error instanceof Error
            ? error.message
            : String(error)
        }`,
      );

      return null;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | WHATSAPP HELPER
  |--------------------------------------------------------------------------
  |
  | This guarantees that WhatsApp uses:
  |
  |     wa
  |
  */

  async getWhatsAppPrices(
    country?: string,
  ): Promise<SmsBowerPriceResponse> {
    return this.getPrices(
      'wa',
      country,
    );
  }

  /*
  |--------------------------------------------------------------------------
  | BUY NUMBER
  |--------------------------------------------------------------------------
  */

  async buy(
    service: string,
    country: string,
    maxPrice?: number,
  ): Promise<SmsBowerBuyResponse> {
    const raw = await this.request(
      {
        action: 'getNumber',

        /*
         * WhatsApp must arrive here as:
         *
         * service=wa
         */

        service,

        country,

        maxPrice,
      },

      this.BUY_TIMEOUT_MS,
    );

    const parsed =
      this.parseTextResponse(raw);

    if (
      parsed.code !== 'ACCESS_NUMBER'
    ) {
      throw new BadGatewayException(
        `SMSBower could not allocate a number: ${parsed.raw}`,
      );
    }

    const values = (
      parsed.value ?? ''
    ).split(':');

    const id = values[0];
    const phone = values.slice(1).join(':');

    if (!id || !phone) {
      throw new BadGatewayException(
        `Unexpected SMSBower getNumber response: ${parsed.raw}`,
      );
    }

    return {
      id,
      phone,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | BUY WHATSAPP NUMBER
  |--------------------------------------------------------------------------
  */

  async buyWhatsApp(
    country: string,
    maxPrice?: number,
  ): Promise<SmsBowerBuyResponse> {
    return this.buy(
      'wa',
      country,
      maxPrice,
    );
  }

  /*
  |--------------------------------------------------------------------------
  | SET STATUS
  |--------------------------------------------------------------------------
  |
  | 1 = ready / confirm SMS
  | 3 = request another SMS
  | 6 = finish activation
  | 8 = cancel activation
  |
  */

  async setStatus(
    id: string,
    status: 1 | 3 | 6 | 8,
  ): Promise<string> {
    const raw = await this.request({
      action: 'setStatus',
      id,
      status,
    });

    return this.parseTextResponse(
      raw,
    ).code;
  }

  /*
  |--------------------------------------------------------------------------
  | FINISH
  |--------------------------------------------------------------------------
  */

  async finish(
    id: string,
  ): Promise<string> {
    return this.setStatus(id, 6);
  }

  /*
  |--------------------------------------------------------------------------
  | CANCEL
  |--------------------------------------------------------------------------
  */

  async cancel(
    id: string,
  ): Promise<string> {
    return this.setStatus(id, 8);
  }

  /*
  |--------------------------------------------------------------------------
  | GET STATUS
  |--------------------------------------------------------------------------
  */

  async getStatus(
    id: string,
  ): Promise<SmsBowerStatusResponse> {
    const raw = await this.request({
      action: 'getStatus',
      id,
    });

    return this.parseTextResponse(
      raw,
    );
  }

  /*
  |--------------------------------------------------------------------------
  | CHECK WHATSAPP AVAILABILITY
  |--------------------------------------------------------------------------
  |
  | Useful for your marketplace.
  |
  */

  async checkWhatsAppAvailability(
    country?: string,
  ) {
    const prices =
      await this.getWhatsAppPrices(
        country,
      );

    const results: Array<{
      country: string;
      cost: number;
      count: number;
      available: boolean;
    }> = [];

    for (const [
      countryId,
      services,
    ] of Object.entries(prices)) {
      const whatsapp =
        services?.wa;

      if (!whatsapp) {
        continue;
      }

      results.push({
        country: countryId,
        cost: Number(
          whatsapp.cost ?? 0,
        ),
        count: Number(
          whatsapp.count ?? 0,
        ),
        available:
          Number(
            whatsapp.count ?? 0,
          ) > 0,
      });
    }

    return results;
  }

  /*
  |--------------------------------------------------------------------------
  | HEALTH CHECK
  |--------------------------------------------------------------------------
  */

  async ping() {
    try {
      const balance =
        await this.getBalance();

      return {
        provider: 'SMSBOWER',
        status: 'online',
        balance,
        baseUrl: this.baseUrl,
      };
    } catch {
      return {
        provider: 'SMSBOWER',
        status: 'offline',
      };
    }
  }

  /*
  |--------------------------------------------------------------------------
  | DEBUG / DIAGNOSTIC
  |--------------------------------------------------------------------------
  |
  | This is useful right now because we're trying to find out
  | why WhatsApp isn't appearing in your website.
  |
  */

  async diagnostics() {
    const result: any = {
      provider: 'SMSBOWER',
      baseUrl: this.baseUrl,
      whatsappServiceCode: 'wa',
    };

    /*
     * Balance
     */

    try {
      result.balance =
        await this.getBalance();
    } catch (error) {
      result.balanceError =
        error instanceof Error
          ? error.message
          : String(error);
    }

    /*
     * Services
     */

    try {
      const services =
        await this.getServicesList();

      result.servicesCount =
        services?.length ?? 0;

      result.whatsappService =
        services?.find(
          (service) =>
            service.code
              .toLowerCase() === 'wa',
        ) ?? null;
    } catch (error) {
      result.servicesError =
        error instanceof Error
          ? error.message
          : String(error);
    }

    /*
     * WhatsApp prices
     */

    try {
      const prices =
        await this.getPrices('wa');

      result.whatsappPrices =
        prices;
    } catch (error) {
      result.whatsappPricesError =
        error instanceof Error
          ? error.message
          : String(error);
    }

    return result;
  }
}