import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import axios, { AxiosInstance } from 'axios';
import { createHmac } from 'crypto';

export type PocketFiBank = 'kuda' | 'safehaven';

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
      baseURL: process.env.POCKETFI_BASE_URL ?? 'https://api.pocketfi.ng/v1',
      timeout: 30000,
      headers: {
        Authorization: `Bearer ${process.env.POCKETFI_SECRET_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

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

      const response = await this.client.post('/virtual-accounts/create', {
        first_name: params.firstName,
        last_name: params.lastName,
        phone: params.phone,
        email: params.email,
        businessId: this.businessId,
        bank: params.bank,
        ...(params.nin && { nin: params.nin }),
        ...(params.bvn && { bvn: params.bvn }),
      });

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
      this.logger.error(error.response?.data ?? error.message);
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

      Tries POCKETFI_WEBHOOK_SECRET first (if PocketFi gives you a
      separate webhook secret in the dashboard). Falls back to
      POCKETFI_SECRET_KEY. Also strips "sha512=" prefix if present.
  =====================================
  */
  verifyWebhook(payload: Buffer, signature: string): boolean {
    if (!signature) return false;

    // Some providers prefix the signature: "sha512=abc123..."
    const cleanSig = signature.replace(/^(sha512|sha256)=/, '');

    const secret =
      process.env.POCKETFI_WEBHOOK_SECRET || process.env.POCKETFI_SECRET_KEY;

    if (!secret) {
      this.logger.warn('No webhook secret available, skipping verification');
      return true;
    }

    const hash = createHmac('sha512', secret).update(payload).digest('hex');

    // Try hex comparison (case-insensitive)
    return hash.toLowerCase() === cleanSig.toLowerCase();
  }
}