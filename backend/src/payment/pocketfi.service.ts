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

      Tries every combination of secret + algorithm so we can figure
      out what PocketFi actually uses. Logs all attempts for debugging.
  =====================================
  */
  verifyWebhook(
    payload: Buffer,
    signature: string,
  ): { valid: boolean; debug: string } {
    if (!signature) {
      return { valid: false, debug: 'Signature header is missing' };
    }

    const cleanSig = signature.toLowerCase().trim();

    const candidates = [
      {
        name: 'POCKETFI_SECRET_KEY + sha512',
        secret: process.env.POCKETFI_SECRET_KEY,
        algo: 'sha512',
      },
      {
        name: 'POCKETFI_SECRET_KEY + sha256',
        secret: process.env.POCKETFI_SECRET_KEY,
        algo: 'sha256',
      },
      {
        name: 'POCKETFI_BUSINESS_ID + sha512',
        secret: process.env.POCKETFI_BUSINESS_ID,
        algo: 'sha512',
      },
      {
        name: 'POCKETFI_BUSINESS_ID + sha256',
        secret: process.env.POCKETFI_BUSINESS_ID,
        algo: 'sha256',
      },
    ];

    const debugLines: string[] = [];
    debugLines.push(`Received signature: ${cleanSig}`);

    for (const c of candidates) {
      if (!c.secret) {
        debugLines.push(`${c.name}: (secret not set)`);
        continue;
      }
      const hash = createHmac(c.algo, c.secret)
        .update(payload)
        .digest('hex')
        .toLowerCase();
      debugLines.push(`${c.name}: ${hash}`);

      if (hash === cleanSig) {
        return { valid: true, debug: `Matched with ${c.name}` };
      }
    }

    return { valid: false, debug: debugLines.join('\n') };
  }
}