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

  // Simple in-memory cache for the country/service reference lists —
  // these change rarely, so there's no need to hit the API on every
  // dropdown load. 1 hour TTL.
  private countriesCache: { data: { id: string; name: string }[]; expiresAt: number } | null = null;
  private servicesCache: { data: { code: string; name: string }[]; expiresAt: number } | null = null;
  private readonly CACHE_TTL_MS = 60 * 60 * 1000;

  // Default timeout for lookup-style actions (getBalance, getPrices,
  // getStatus, setStatus, country/service lists) — these just read
  // cached/static data on GrizzySMS's side and are consistently fast.
  private readonly DEFAULT_TIMEOUT_MS = 15000;

  // FIX: getNumber (buy()) was sharing the same 15s timeout as every
  // other action, but it isn't a lookup — it's GrizzySMS actually
  // allocating a number from an upstream carrier pool for the given
  // service+country, which is structurally slower and more prone to
  // hanging than a cached read. A thin/contended pool could routinely
  // need more than 15s to respond, and every timeout here was, until
  // now, indistinguishable from a fast BAD_ACTION/NO_NUMBERS error to
  // the caller. Give it its own longer budget.
  private readonly BUY_TIMEOUT_MS = 30000;

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
    const configured = this.config.get<string>('GRIZZYSMS_BASE_URL');

    if (!configured) {
      return 'https://api.grizzlysms.com/stubs/handler_api.php';
    }

    // Accept either the bare domain (e.g. "https://api.grizzlysms.com",
    // the form GrizzySMS's own official tooling documents for this env
    // var) or a full path already including /stubs/handler_api.php.
    // Appending the fixed action-protocol path ourselves means both
    // forms work, instead of silently producing a broken URL (and a
    // 502) if someone configures just the domain.
    const trimmed = configured.replace(/\/+$/, '');
    return trimmed.endsWith('/handler_api.php')
      ? trimmed
      : `${trimmed}/stubs/handler_api.php`;
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
   *
   * FIX: accepts an optional per-call `timeoutMs` override (defaults to
   * DEFAULT_TIMEOUT_MS) instead of a single hardcoded 15000 for every
   * action. Slower actions like getNumber can now request more budget
   * without affecting the fast lookup actions.
   */
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
          transformResponse: (res) => res, // keep raw string, don't auto-JSON-parse
        }),
      );

      return typeof data === 'string' ? data : JSON.stringify(data);
    } catch (error) {
      const err = error as AxiosError;

      // FIX: `this.apiKey` (which can throw InternalServerErrorException
      // if GRIZZYSMS_API_KEY is unset) used to be read OUTSIDE this
      // try/catch, so a missing key failed completely silently — no log
      // line, no BadGatewayException, just an unhandled exception with
      // no trace of *why*. Moving the key/query construction inside the
      // try means every failure mode (bad config, network error, HTTP
      // error status) now hits this one logging + rethrow path.
      this.logger.error(`
========== GRIZZYSMS ERROR ==========
params: ${JSON.stringify(params)}
timeoutMs: ${timeoutMs}
STATUS: ${err.response?.status}
RESPONSE: ${JSON.stringify(err.response?.data)}
MESSAGE: ${error instanceof Error ? error.message : String(error)}
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
        COUNTRIES / SERVICES
        (live names, no hardcoding)
  =============================== */

  /**
   * Attempts `action=getCountries` — same action-naming convention as
   * every other call in this protocol (getBalance, getPrices,
   * getNumber...), and a real live equivalent is confirmed to exist for
   * this API by third-party tooling built specifically for GrizzySMS.
   * Returns null (never throws) if this account/API version doesn't
   * support it, so callers can fall back to raw ids from getPricesV2.
   */
  async getCountriesList(): Promise<
    { id: string; name: string }[] | null
  > {
    if (this.countriesCache && this.countriesCache.expiresAt > Date.now()) {
      return this.countriesCache.data;
    }

    try {
      const raw = await this.request({ action: 'getCountries' });

      // Log the raw response once so it's visible in the terminal —
      // no curl needed to see why names might not be parsing.
      this.logger.debug(
        `GrizzySMS getCountries raw response: ${raw.slice(0, 500)}`,
      );

      const parsed = JSON.parse(raw);

      let result: { id: string; name: string }[] | null = null;

      // Expected shape: either an array of { id, name/name_en/rus } or
      // an object keyed by id. Normalize both.
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

  /**
   * Uses `action=getServicesList` — confirmed via GrizzySMS's own API
   * docs (not the standard handler_api.php action name `getServices`,
   * which returns BAD_ACTION on this API). Response is confirmed (via
   * live testing) to be `{ services: [{ code, name }, ...] }`.
   */
  async getServicesList(): Promise<
    { code: string; name: string }[] | null
  > {
    if (this.servicesCache && this.servicesCache.expiresAt > Date.now()) {
      return this.servicesCache.data;
    }

    try {
      const raw = await this.request({ action: 'getServicesList' });

      // Log the raw response once so it's visible in the terminal —
      // no curl needed to see why names might not be parsing.
      this.logger.debug(
        `GrizzySMS getServicesList raw response: ${raw.slice(0, 500)}`,
      );

      const parsed = JSON.parse(raw);

      // CONFIRMED (live response): getServicesList replies with
      // `{ "services": [ { "code": "...", "name": "..." }, ... ] }` —
      // an object wrapping an array, not a bare array and not a
      // code-keyed object like getCountries. Unwrap that first; keep
      // the array/object branches below as a fallback in case the API
      // ever changes shape.
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
  ): Promise<GrizzyBuyResponse> {
    // FIX: getNumber allocates a number from GrizzySMS's upstream
    // carrier pool, unlike the other actions which just read cached/
    // static data. It gets its own longer timeout (BUY_TIMEOUT_MS)
    // instead of sharing DEFAULT_TIMEOUT_MS, which was too tight for
    // this specific action and was causing spurious "timeout of
    // 15000ms exceeded" failures on otherwise-valid purchases.
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