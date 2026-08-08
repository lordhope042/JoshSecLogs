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
GRIZZYSMS PROVIDER

GrizzySMS speaks the classic "handler_api.php" protocol — the same
protocol used by SMS-Activate and its many resellers (smsbower,
kopeechka-family clones, etc). It is NOT a JSON REST API like 5sim:

  - getBalance / getNumber / setStatus / getStatus respond with plain
    TEXT in the form `CODE` or `CODE:value1:value2`, not JSON.
  - getPrices / getPricesV2 respond with JSON, nested by country then
    service code (numeric country ids and short service codes — e.g.
    "0" = Russia, "wa" = WhatsApp — NOT the same codes 5sim uses).
  - Prices are in RUB (Russian Rubles), not USD.

VERIFY BEFORE GOING LIVE: this implementation follows the standard,
well-documented handler_api.php protocol. GrizzySMS's own docs page is
a JS-rendered SPA that couldn't be scraped for exact confirmation —
test each action once with curl/Postman against a real API key and
compare against the parsing below, especially `getPricesV2` (some
resellers add extra fields to the v2 response).
=====================================
*/

export interface GrizzyBuyResponse {
  id: string;
  phone: string;
}

export interface GrizzyStatusResponse {
  raw: string;
  code: string;
  value?: string;
}

// { [countryId]: { [serviceCode]: { cost: number; count: number } } }
export interface GrizzyPriceResponse {
  [countryId: string]: {
    [serviceCode: string]: {
      cost: number;
      count: number;
    };
  };
}

@Injectable()
export class GrizzySmsService {
  private readonly logger = new Logger(GrizzySmsService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  /* ===============================
            CONFIG
  =============================== */

  private get apiKey(): string {
    const key = this.config.get<string>('GRIZZYSMS_API_KEY');
    if (!key) {
      throw new InternalServerErrorException('Missing GRIZZYSMS_API_KEY');
    }
    return key;
  }

  private get baseUrl(): string {
    const url =
      this.config.get<string>('GRIZZYSMS_BASE_URL') ||
      'https://api.grizzlysms.com/stubs/handler_api.php';
    return url;
  }

  /* ===============================
          CORE REQUEST
  =============================== */

  /**
   * Every handler_api.php action is a GET with query params. Some
   * actions (getBalance, getNumber, setStatus, getStatus) return raw
   * text; others (getPrices, getPricesV2) return JSON. We always fetch
   * as text first, then let the caller decide how to parse it — this
   * avoids axios throwing on a text/plain content-type when JSON was
   * expected, or vice versa.
   */
  private async request(
    params: Record<string, string | number | undefined>,
  ): Promise<string> {
    const query = new URLSearchParams();
    query.set('api_key', this.apiKey);

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        query.set(key, String(value));
      }
    }

    try {
      const { data } = await firstValueFrom(
        this.http.request<string>({
          method: 'GET',
          url: `${this.baseUrl}?${query.toString()}`,
          timeout: 15000,
          responseType: 'text',
          transformResponse: (res) => res, // keep raw string, don't auto-JSON-parse
        }),
      );

      return typeof data === 'string' ? data : JSON.stringify(data);
    } catch (error) {
      const err = error as AxiosError;

      this.logger.error(`
========== GRIZZYSMS ERROR ==========
params: ${JSON.stringify(params)}
STATUS: ${err.response?.status}
RESPONSE: ${JSON.stringify(err.response?.data)}
======================================
      `);

      throw new BadGatewayException('GrizzySMS request failed');
    }
  }

  /**
   * Parses the classic `CODE` or `CODE:value1:value2` text response
   * format shared by getBalance/getNumber/setStatus/getStatus.
   */
  private parseTextResponse(raw: string): GrizzyStatusResponse {
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
        `Unexpected GrizzySMS balance response: ${parsed.raw}`,
      );
    }

    return Number(parsed.value ?? 0);
  }

  /* ===============================
            PRICES
  =============================== */

  /**
   * `service` and `country` are optional — omit both to get pricing for
   * every service across every country (a large payload).
   */
  async getPrices(
    service?: string,
    country?: string,
  ): Promise<GrizzyPriceResponse> {
    const raw = await this.request({ action: 'getPrices', service, country });

    try {
      return JSON.parse(raw);
    } catch {
      throw new BadGatewayException(
        `GrizzySMS getPrices returned non-JSON: ${raw.slice(0, 200)}`,
      );
    }
  }

  async getPricesV2(
    service?: string,
    country?: string,
  ): Promise<GrizzyPriceResponse> {
    const raw = await this.request({
      action: 'getPricesV2',
      service,
      country,
    });

    try {
      return JSON.parse(raw);
    } catch {
      throw new BadGatewayException(
        `GrizzySMS getPricesV2 returned non-JSON: ${raw.slice(0, 200)}`,
      );
    }
  }

  /* ===============================
            BUY (getNumber)
  =============================== */

  async buy(
    service: string,
    country: string,
    maxPrice?: number,
  ): Promise<GrizzyBuyResponse> {
    const raw = await this.request({
      action: 'getNumber',
      service,
      country,
      maxPrice,
    });

    const parsed = this.parseTextResponse(raw);

    if (parsed.code !== 'ACCESS_NUMBER') {
      // Known handler_api.php error codes: NO_NUMBERS, NO_BALANCE,
      // BAD_ACTION, BAD_SERVICE, BAD_KEY, ERROR_SQL, WRONG_MAX_PRICE
      throw new BadGatewayException(
        `GrizzySMS could not allocate a number: ${parsed.raw}`,
      );
    }

    const [id, phone] = (parsed.value ?? '').split(':');

    if (!id || !phone) {
      throw new BadGatewayException(
        `Unexpected GrizzySMS getNumber response: ${parsed.raw}`,
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

  async getStatus(id: string): Promise<GrizzyStatusResponse> {
    const raw = await this.request({ action: 'getStatus', id });
    return this.parseTextResponse(raw);
  }

  /* ===============================
              HEALTH
  =============================== */

  async ping() {
    try {
      const balance = await this.getBalance();
      return { provider: 'GRIZZYSMS', status: 'online', balance };
    } catch {
      return { provider: 'GRIZZYSMS', status: 'offline' };
    }
  }
}
