import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import axios, { AxiosInstance } from 'axios';
import { createHmac } from 'crypto';

export type PocketFiBank = 'kuda' | 'saveheaven';

@Injectable()
export class PocketFiService {
  private readonly logger = new Logger(PocketFiService.name);

  private readonly client: AxiosInstance;

  private readonly businessId: string;

  constructor() {
    if (!process.env.POCKETFI_SECRET_KEY) {
      throw new Error('POCKETFI_SECRET_KEY is missing.');
    }

    if (!process.env.POCKETFI_BUSINESS_ID) {
      throw new Error('POCKETFI_BUSINESS_ID is missing.');
    }

    this.businessId = process.env.POCKETFI_BUSINESS_ID;

    this.client = axios.create({
      baseURL:
        process.env.POCKETFI_BASE_URL ?? 'https://api.pocketfi.ng/v1',
      timeout: 30000,
      headers: {
        Authorization: `Bearer ${process.env.POCKETFI_SECRET_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  /*
  =====================================
      CREATE STATIC VIRTUAL ACCOUNT
      One permanent account per user per bank — funds sent to it at
      any time trigger PocketFi's webhook.
  =====================================
  */
  async createStaticAccount(params: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    bank: PocketFiBank;
    nin?: string;
    bvn?: string;
  }) {
    try {
      this.logger.log(
        `Creating PocketFi ${params.bank} virtual account for ${params.email}`,
      );

      const response = await this.client.post(
        '/virtual-accounts/create',
        {
          first_name: params.firstName,
          last_name: params.lastName,
          phone: params.phone,
          email: params.email,
          businessId: this.businessId,
          bank: params.bank,
          ...(params.nin && { nin: params.nin }),
          ...(params.bvn && { bvn: params.bvn }),
        },
      );

      const result = response.data;

      if (!result?.status) {
        throw new BadRequestException(
          result?.message ?? 'Unable to create virtual account.',
        );
      }

      const account = result.banks?.[0];

      if (!account?.accountNumber) {
        throw new InternalServerErrorException(
          'PocketFi did not return an account number.',
        );
      }

      return {
        bankName: account.bankName as string,
        accountNumber: account.accountNumber as string,
        accountName: account.accountName as string,
      };
    } catch (error: any) {
      this.logger.error(
        error.response?.data ?? error.message,
      );

      throw new BadRequestException(
        error.response?.data?.message ??
          error.message ??
          'Unable to create virtual account.',
      );
    }
  }

  /*
  =====================================
      VERIFY WEBHOOK SIGNATURE
      HMAC-SHA512 of the RAW request body, keyed with the secret key.
      Compared against the signature header PocketFi sends.
  =====================================
  */
  verifyWebhook(payload: Buffer, signature: string): boolean {
    if (!signature) return false;

    const hash = createHmac(
      'sha512',
      process.env.POCKETFI_SECRET_KEY!,
    )
      .update(payload)
      .digest('hex');

    return hash === signature;
  }
}