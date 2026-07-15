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
export interface FiveSimSmsItem {
  id: number;
  created_at: string;
  date: string;
  sender: string;
  text: string;
  code: string;
}

export interface FiveSimCheckResponse {
  id: number;
  status: string;
  phone: string;
  price: number;
  expires: string;
  country: string;
  operator: string;
  product: string;
  sms: FiveSimSmsItem[] | null;
}
// Add interfaces for the responses
export interface FiveSimCheckResponse {
  id: number;
  status: string;
  phone: string;
  price: number;
  expires: string;
  country: string;
  operator: string;
  product: string;
  // Add other fields as needed
}

export interface FiveSimBuyResponse {
  id: number;
  phone: string;
  price: number;
  status: string;
  country: string;
  operator: string;
  product: string;
  // Add other fields as needed
}

export interface FiveSimPriceResponse {
  [country: string]: {
    [service: string]: {
      [activationType: string]: {
        cost: number;
        count: number;
        // Add other fields as needed
      };
    };
  };
}

export interface FiveSimCountryResponse {
  [code: string]: {
    text: string;
    name?: string;
    iso?: { [key: string]: string };
    prefix?: { [key: string]: string };
    flag?: string;
    img?: string;
  };
}

export interface FiveSimProductResponse {
  [service: string]: {
    text: string;
    name?: string;
    image?: string;
    img?: string;
  };
}

export interface FiveSimSmsResponse {
  [key: string]: {
    id: number;
    text: string;
    expires: string;
    // Add other fields as needed
  };
}

@Injectable()
export class FiveSimService {
  private readonly logger = new Logger(FiveSimService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  /* ===============================
            CONFIG
  =============================== */

  private get apiKey(): string {
    const key = this.config.get<string>('FIVESIM_API_KEY');
    if (!key) throw new InternalServerErrorException('Missing FIVESIM_API_KEY');
    return key;
  }

  private get baseUrl(): string {
    const url = this.config.get<string>('FIVESIM_BASE_URL') || 'https://5sim.net/v1';
    return url.replace(/\/$/, '');
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      Accept: 'application/json',
    };
  }

  /* ===============================
          CORE REQUEST
  =============================== */

  private async request<T>(
    method: 'GET',
    endpoint: string,
  ): Promise<T> {
    try {
      const { data } = await firstValueFrom(
        this.http.request<T>({
          method,
          url: `${this.baseUrl}${endpoint}`,
          headers: this.headers,
          timeout: 15000,
        }),
      );

      return data;
    } catch (error) {
      const err = error as AxiosError;

      this.logger.error(`
========== 5SIM ERROR ==========
${method} ${endpoint}
STATUS: ${err.response?.status}
RESPONSE: ${JSON.stringify(err.response?.data, null, 2)}
================================
      `);

      throw new BadGatewayException(
        err.response?.data || '5SIM request failed',
      );
    }
  }

  private get<T>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint);
  }

  /* ===============================
            PUBLIC API
  =============================== */

  profile() {
    return this.get<{ id: number; email: string }>('/user/profile');
  }

  /* ===============================
          ACTIVATIONS (FIXED)
  =============================== */

  activeOrders() {
    return this.get<{ [key: string]: FiveSimCheckResponse }>('/user/activation/active');
  }

  history() {
    return this.get<{ [key: string]: FiveSimCheckResponse }>('/user/activation/history');
  }

  check(id: number): Promise<FiveSimCheckResponse> {
    return this.get<FiveSimCheckResponse>(`/user/check/${id}`);
  }

  sms(id: number): Promise<FiveSimSmsResponse> {
    return this.get<FiveSimSmsResponse>(`/user/sms/inbox/${id}`);
  }

  finish(id: number): Promise<{ success: boolean }> {
    return this.get<{ success: boolean }>(`/user/finish/${id}`);
  }

  cancel(
  id: number,
): Promise<FiveSimCheckResponse> {
  return this.get<FiveSimCheckResponse>(
    `/user/cancel/${id}`,
  );
}

  ban(id: number): Promise<{ success: boolean }> {
    return this.get<{ success: boolean }>(`/user/ban/${id}`);
  }

  /* ===============================
            GUEST API
  =============================== */

  countries(): Promise<FiveSimCountryResponse> {
    return this.get<FiveSimCountryResponse>('/guest/countries');
  }

  products(country: string, operator = 'any'): Promise<FiveSimProductResponse> {
    return this.get<FiveSimProductResponse>(
      `/guest/products/${encodeURIComponent(country)}/${encodeURIComponent(operator)}`,
    );
  }

  prices(country: string): Promise<FiveSimPriceResponse> {
    return this.get<FiveSimPriceResponse>(`/guest/prices?country=${encodeURIComponent(country)}`);
  }

  /* ===============================
              BUY
  =============================== */

  buy(country: string, activationType: string, service: string): Promise<FiveSimBuyResponse> {
    return this.get<FiveSimBuyResponse>(
      `/user/buy/activation/${encodeURIComponent(country)}/${encodeURIComponent(
        activationType,
      )}/${encodeURIComponent(service)}`,
    );
  }

  /* ===============================
              HEALTH
  =============================== */

  async ping() {
    try {
      const profile = await this.profile();

      return {
        provider: '5SIM',
        status: 'online',
        profile,
      };
    } catch {
      return {
        provider: '5SIM',
        status: 'offline',
      };
    }
  }
}