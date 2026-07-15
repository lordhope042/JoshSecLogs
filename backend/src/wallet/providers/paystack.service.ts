import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import axios, { AxiosInstance } from 'axios';
import { createHmac } from 'crypto';

@Injectable()
export class PaystackService {
  private readonly logger = new Logger(PaystackService.name);

  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.paystack.co',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  /*
  =====================================
      INITIALIZE PAYMENT
  =====================================
  */

  async initializePayment(
    email: string,
    amount: number,
    reference: string,
  ) {
    try {
      const { data } = await this.client.post(
        '/transaction/initialize',
        {
          email,
          amount: amount * 100,
          reference,
          currency: 'NGN',
        },
      );

      return data.data;
    } catch (error: any) {
      this.logger.error(
        error.response?.data || error.message,
      );

      throw new BadRequestException(
        error.response?.data?.message ??
          'Unable to initialize payment.',
      );
    }
  }

  /*
  =====================================
      VERIFY PAYMENT
  =====================================
  */

  async verifyPayment(reference: string) {
    try {
      const { data } = await this.client.get(
        `/transaction/verify/${reference}`,
      );

      if (!data.status) {
        throw new BadRequestException(
          'Verification failed.',
        );
      }

      return data.data;
    } catch (error: any) {
      this.logger.error(
        error.response?.data || error.message,
      );

      throw new BadRequestException(
        error.response?.data?.message ??
          'Unable to verify payment.',
      );
    }
  }

  /*
  =====================================
      LIST BANKS
  =====================================
  */

  async listBanks() {
    try {
      const { data } = await this.client.get(
        '/bank',
      );

      return data.data;
    } catch (error: any) {
      throw new InternalServerErrorException(
        'Unable to fetch banks.',
      );
    }
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
      const { data } = await this.client.get(
        '/bank/resolve',
        {
          params: {
            account_number: accountNumber,
            bank_code: bankCode,
          },
        },
      );

      return data.data;
    } catch (error: any) {
      throw new BadRequestException(
        error.response?.data?.message ??
          'Unable to resolve account.',
      );
    }
  }

  /*
  =====================================
      VERIFY WEBHOOK SIGNATURE
  =====================================
  */

  verifySignature(
    signature: string,
    payload: Buffer,
  ): boolean {
    const expected = createHmac(
      'sha512',
      process.env.PAYSTACK_SECRET_KEY!,
    )
      .update(payload)
      .digest('hex');

    return expected === signature;
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