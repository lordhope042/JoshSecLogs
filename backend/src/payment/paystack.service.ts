import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import axios, {
  AxiosInstance,
} from 'axios';

import { createHmac } from 'crypto';

@Injectable()
export class PaystackService {
  private readonly logger =
    new Logger(PaystackService.name);

  private readonly client: AxiosInstance;

  constructor() {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      throw new Error(
        'PAYSTACK_SECRET_KEY is missing.',
      );
    }

    this.client = axios.create({
      baseURL: 'https://api.paystack.co',
      timeout: 30000,
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /*
  =====================================
      INITIALIZE PAYMENT
  =====================================
  */

  async initialize(
    email: string,
    amount: number,
    reference: string,
  ) {
    try {
      if (!process.env.FRONTEND_URL) {
        throw new InternalServerErrorException(
          'FRONTEND_URL is not configured.',
        );
      }

      const callbackUrl =
        `${process.env.FRONTEND_URL}/dashboard/wallet/callback`;

      this.logger.log(
        `Initializing payment ${reference}`,
      );

      this.logger.log(
        `Callback URL -> ${callbackUrl}`,
      );

      const response =
        await this.client.post(
          '/transaction/initialize',
          {
            email,
            amount: amount * 100,
            currency: 'NGN',
            reference,
            callback_url: callbackUrl,
          },
        );

      const result = response.data;

      if (!result.status) {
        throw new BadRequestException(
          result.message ??
            'Unable to initialize payment.',
        );
      }

      if (
        !result.data.authorization_url
      ) {
        throw new InternalServerErrorException(
          'Paystack did not return an authorization URL.',
        );
      }

      return {
        authorizationUrl:
          result.data.authorization_url,

        accessCode:
          result.data.access_code,

        reference:
          result.data.reference,
      };
    } catch (error: any) {
      this.logger.error(
        error.response?.data ??
          error.message,
      );

      throw new BadRequestException(
        error.response?.data?.message ??
          error.message ??
          'Unable to initialize payment.',
      );
    }
  }

  /*
  =====================================
      VERIFY PAYMENT
  =====================================
  */

  async verify(reference: string) {
    try {
      this.logger.log(
        `Verifying payment ${reference}`,
      );

      const response =
        await this.client.get(
          `/transaction/verify/${reference}`,
        );

      const result = response.data;

      if (!result.status) {
        throw new BadRequestException(
          result.message ??
            'Unable to verify payment.',
        );
      }

      return {
        status:
          result.data.status,

        reference:
          result.data.reference,

        amount:
          Number(result.data.amount) /
          100,

        currency:
          result.data.currency,

        paidAt:
          result.data.paid_at,

        gatewayResponse:
          result.data.gateway_response,

        channel:
          result.data.channel,

        customer:
          result.data.customer,

        raw: result.data,
      };
    } catch (error: any) {
      this.logger.error(
        error.response?.data ??
          error.message,
      );

      throw new BadRequestException(
        error.response?.data?.message ??
          error.message ??
          'Unable to verify payment.',
      );
    }
  }

  /*
  =====================================
      LIST BANKS
  =====================================
  */

  async banks() {
    const { data } =
      await this.client.get('/bank');

    return data.data;
  }

  /*
  =====================================
      RESOLVE ACCOUNT
  =====================================
  */

  async resolveAccount(
    accountNumber: string,
    bankCode: string,
  ) {
    try {
      const { data } =
        await this.client.get(
          '/bank/resolve',
          {
            params: {
              account_number:
                accountNumber,
              bank_code: bankCode,
            },
          },
        );

      return data.data;
    } catch (error: any) {
      this.logger.error(
        error.response?.data ??
          error.message,
      );

      throw new BadRequestException(
        error.response?.data?.message ??
          'Unable to resolve account.',
      );
    }
  }

  /*
  =====================================
      VERIFY WEBHOOK
  =====================================
  */

  verifyWebhook(
    payload: Buffer,
    signature: string,
  ) {
    const hash = createHmac(
      'sha512',
      process.env.PAYSTACK_SECRET_KEY!,
    )
      .update(payload)
      .digest('hex');

    return hash === signature;
  }

  /*
  =====================================
      HEALTH CHECK
  =====================================
  */

  async ping() {
    try {
      await this.client.get('/bank');
      return true;
    } catch {
      return false;
    }
  }
}