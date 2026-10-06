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
=====================================
SMSBOWER PROVIDER

SMSBower is a reseller on the same classic "handler_api.php" protocol as
GrizzySMS / SMS-Activate / SMSHub / HeroSMS — so this service is a
near-verbatim copy of GrizzySmsService, only the base URL / env var
names / provider label differ:

  - getBalance / getNumber / setStatus / getStatus respond with plain
    TEXT in the form `CODE` or `CODE:value1:value2`, not JSON.
  - getPrices / getPricesV2 respond with JSON, nested by country then
    service code.
  - Prices are in RUB (Russian Rubles), not USD — same as GrizzySMS.

VERIFY BEFORE GOING LIVE:
  1. SMSBOWER_BASE_URL below is set to the commonly-documented SMSBower
     domain, but resellers on this protocol occasionally change domains
     or run mirrors — confirm the exact base URL from your SMSBower
     account/dashboard and set SMSBOWER_BASE_URL in your .env if it
     differs.
  2. Run getPricesV2 once with a real key and diff the raw shape against
     GrizzySMS's — resellers sometimes tweak the v2 payload (see the
     resolvePriceAndStock() FIX comment in marketplace.service.ts for
     the kind of shape mismatch that bit GrizzySMS).
=====================================
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

// { [countryId]: { [serviceCode]: { cost: number; count: number } } }
export interface SmsBowerPriceResponse {
  [countryId: string]: {
    [serviceCode: string]: {
      cost: number;
      count: number;
    };
  };
}

@Injectable()
export class SmsBowerService {
  private readonly logger = new Logger(SmsBowerService.name);

  // Same 1-hour cache pattern as GrizzySmsService for the reference lists.
  private countriesCache: { data: { id: string; name: string }[]; expiresAt: number } | null = null;
  private servicesCache: { data: { code: string; name: string }[]; expiresAt: number } | null = null;
  private readonly CACHE_TTL_MS = 60 * 60 * 1000;

  private readonly DEFAULT_TIMEOUT_MS = 15000;

  // getNumber allocates from an upstream carrier pool — give it more
  // budget than the cached-read actions, same reasoning as GrizzySMS.
  private readonly BUY_TIMEOUT_MS = 30000;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  /* ===============================
            CONFIG
  =============================== */

  private get apiKey(): string {
    const key = this.config.get<string>('SMSBOWER_API_KEY');
    if (!key) {
      throw new InternalServerErrorException('Missing SMSBOWER_API_KEY');
    }
    return key;
  }

  private get baseUrl(): string {
    const configured = this.config.get<string>('SMSBOWER_BASE_URL');

    if (!configured) {
      return 'https://smsbower.online/stubs/handler_api.php';
    }

    // Accept either a bare domain or a full path already including
    // /stubs/handler_api.php, same normalization as GrizzySmsService.
    const trimmed = configured.replace(/\/+$/, '');
    return trimmed.endsWith('/handler_api.php')
      ? trimmed
      : `${trimmed}/stubs/handler_api.php`;
  }

  /* ===============================
          CORE REQUEST
  =============================== */

  private async request(
    params: Record<string, string | number | undefined>,
    timeoutMs: number = this.DEFAULT_TIMEOUT_MS,
  ): Promise<string> {
    try {
      const query = new URLSearchParams();
      query.set('api_key', this.apiKey);

      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          query.set(key, String(value));
        }
      }

      const { data } = await firstValueFrom(
        this.http.request<string>({
          method: 'GET',
          url: `${this.baseUrl}?${query.toString()}`,
          timeout: timeoutMs,
          responseType: 'text',
          transformResponse: (res) => res,
        }),
      );

      return typeof data === 'string' ? data : JSON.stringify(data);
    } catch (error) {
      const err = error as AxiosError;

      this.logger.error(`
========== SMSBOWER ERROR ==========
params: ${JSON.stringify(params)}
timeoutMs: ${timeoutMs}
STATUS: ${err.response?.status}
RESPONSE: ${JSON.stringify(err.response?.data)}
MESSAGE: ${error instanceof Error ? error.message : String(error)}
=====================================
      `);

      throw new BadGatewayException('SMSBower request failed');
    }
  }

  private parseTextResponse(raw: string): SmsBowerStatusResponse {
    const trimmed = raw.trim();
    const [code, ...rest] = trimmed.split(':');

    return {
      raw: trimmed,
      code,
      value: rest.length > 0 ? rest.join(':') : undefined,
    };
  }

  /* ===============================
            BALANCE
  =============================== */

  async getBalance(): Promise<number> {
    const raw = await this.request({ action: 'getBalance' });
    const parsed = this.parseTextResponse(raw);

    if (parsed.code !== 'ACCESS_BALANCE') {
      throw new BadGatewayException(
        `Unexpected SMSBower balance response: ${parsed.raw}`,
      );
    }

    return Number(parsed.value ?? 0);
  }

  /* ===============================
            PRICES
  =============================== */

  async getPrices(
    service?: string,
    country?: string,
  ): Promise<SmsBowerPriceResponse> {
    const raw = await this.request({ action: 'getPrices', service, country });

    try {
      return JSON.parse(raw);
    } catch {
      throw new BadGatewayException(
        `SMSBower getPrices returned non-JSON: ${raw.slice(0, 200)}`,
      );
    }
  }

  async getPricesV2(
    service?: string,
    country?: string,
  ): Promise<SmsBowerPriceResponse> {
    const raw = await this.request({
      action: 'getPricesV2',
      service,
      country,
    });

    try {
      return JSON.parse(raw);
    } catch {
      throw new BadGatewayException(
        `SMSBower getPricesV2 returned non-JSON: ${raw.slice(0, 200)}`,
      );
    }
  }

  /* ===============================
        COUNTRIES / SERVICES
        (live names, no hardcoding)
  =============================== */

  async getCountriesList(): Promise<
    { id: string; name: string }[] | null
  > {
    if (this.countriesCache && this.countriesCache.expiresAt > Date.now()) {
      return this.countriesCache.data;
    }

    try {
      const raw = await this.request({ action: 'getCountries' });

      this.logger.debug(
        `SMSBower getCountries raw response: ${raw.slice(0, 500)}`,
      );

      const parsed = JSON.parse(raw);

      let result: { id: string; name: string }[] | null = null;

      if (Array.isArray(parsed)) {
        result = parsed
          .map((entry: any) => ({
            id: String(entry.id ?? entry.country ?? ''),
            name: String(
              entry.name_en ?? entry.name ?? entry.eng ?? entry.id ?? '',
            ),
          }))
          .filter((c) => c.id);
      } else if (parsed && typeof parsed === 'object') {
        result = Object.entries(parsed).map(([id, value]: any) => ({
          id,
          name: String(
            value?.name_en ?? value?.name ?? value?.eng ?? id,
          ),
        }));
      }

      if (result) {
        this.countriesCache = {
          data: result,
          expiresAt: Date.now() + this.CACHE_TTL_MS,
        };
      }

      return result;
    } catch {
      return null;
    }
  }

  async getServicesList(): Promise<
    { code: string; name: string }[] | null
  > {
    if (this.servicesCache && this.servicesCache.expiresAt > Date.now()) {
      return this.servicesCache.data;
    }

    try {
      const raw = await this.request({ action: 'getServicesList' });

      this.logger.debug(
        `SMSBower getServicesList raw response: ${raw.slice(0, 500)}`,
      );

      const parsed = JSON.parse(raw);

      const list = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.services)
          ? parsed.services
          : null;

      let result: { code: string; name: string }[] | null = null;

      if (list) {
        result = list
          .map((entry: any) => ({
            code: String(entry.code ?? entry.id ?? ''),
            name: String(entry.name ?? entry.title ?? entry.code ?? ''),
          }))
          .filter((s) => s.code);
      } else if (parsed && typeof parsed === 'object') {
        result = Object.entries(parsed).map(([code, value]: any) => ({
          code,
          name: String(
            typeof value === 'string' ? value : value?.name ?? code,
          ),
        }));
      }

      if (result) {
        this.servicesCache = {
          data: result,
          expiresAt: Date.now() + this.CACHE_TTL_MS,
        };
      }

      return result;
    } catch {
      return null;
    }
  }

  /* ===============================
            BUY (getNumber)
  =============================== */

  async buy(
    service: string,
    country: string,
    maxPrice?: number,
  ): Promise<SmsBowerBuyResponse> {
    const raw = await this.request(
      {
        action: 'getNumber',
        service,
        country,
        maxPrice,
      },
      this.BUY_TIMEOUT_MS,
    );

    const parsed = this.parseTextResponse(raw);

    if (parsed.code !== 'ACCESS_NUMBER') {
      throw new BadGatewayException(
        `SMSBower could not allocate a number: ${parsed.raw}`,
      );
    }

    const [id, phone] = (parsed.value ?? '').split(':');

    if (!id || !phone) {
      throw new BadGatewayException(
        `Unexpected SMSBower getNumber response: ${parsed.raw}`,
      );
    }

    return { id, phone };
  }

  /* ===============================
            SET STATUS
  =============================== */

  /**
   * status meanings (standard handler_api.php):
   *   1 = confirm SMS sent to the number (ready for code)
   *   3 = request another SMS / retry
   *   6 = complete activation (finish, mark as used)
   *   8 = cancel activation
   */
  async setStatus(id: string, status: 1 | 3 | 6 | 8): Promise<string> {
    const raw = await this.request({ action: 'setStatus', id, status });
    return this.parseTextResponse(raw).code;
  }

  finish(id: string) {
    return this.setStatus(id, 6);
  }

  cancel(id: string) {
    return this.setStatus(id, 8);
  }

  /* ===============================
            GET STATUS
  =============================== */

  async getStatus(id: string): Promise<SmsBowerStatusResponse> {
    const raw = await this.request({ action: 'getStatus', id });
    return this.parseTextResponse(raw);
  }

  /* ===============================
              HEALTH
  =============================== */

  async ping() {
    try {
      const balance = await this.getBalance();
      return { provider: 'SMSBOWER', status: 'online', balance };
    } catch {
      return { provider: 'SMSBOWER', status: 'offline' };
    }
  }
}
