import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import axios, { AxiosInstance } from 'axios';
import { createHmac } from 'crypto';

export type PocketFiBank = '9psb' | 'kuda';

@Injectable()
export class PocketFiService {
  private readonly logger = new Logger(PocketFiService.name);

  private readonly client: AxiosInstance;
  private readonly businessId: string;

  constructor() {
    const secretKey = process.env.POCKETFI_SECRET_KEY;
    const businessId = process.env.POCKETFI_BUSINESS_ID;

    if (!secretKey) {
      throw new Error('POCKETFI_SECRET_KEY is missing.');
    }

    if (!businessId) {
      throw new Error('POCKETFI_BUSINESS_ID is missing.');
    }

    this.businessId = businessId;

    /*
     * PocketFi documentation:
     *
     * POST /api/v1/virtual-accounts/create
     *
     * Therefore the base URL must include /api/v1.
     */
    const baseURL =
      process.env.POCKETFI_BASE_URL ??
      'https://api.pocketfi.ng/api/v1';

    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.logger.log(`PocketFi base URL configured: ${baseURL}`);
    this.logger.log(
      `PocketFi API authentication configured: ${Boolean(secretKey)}`,
    );
    this.logger.log(`PocketFi business ID: ${businessId}`);
  }

  /*
  ============================================================
      CREATE STATIC VIRTUAL ACCOUNT

      PocketFi endpoint:

      POST /api/v1/virtual-accounts/create

      Full URL:

      https://api.pocketfi.ng/api/v1/virtual-accounts/create

      One permanent account can be created per customer/bank.
  ============================================================
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
    const payload = {
      first_name: params.firstName,
      last_name: params.lastName,
      phone: params.phone,
      email: params.email,
      businessId: this.businessId,
      bank: params.bank,

      ...(params.nin ? { nin: params.nin } : {}),
      ...(params.bvn ? { bvn: params.bvn } : {}),
    };

    const endpoint = '/virtual-accounts/create';

    try {
      this.logger.log(
        `Creating PocketFi ${params.bank} virtual account for ${params.email}`,
      );

      this.logger.log(
        `PocketFi base URL: ${this.client.defaults.baseURL}`,
      );

      this.logger.log(
        `PocketFi endpoint: POST ${endpoint}`,
      );

      this.logger.log(
        `PocketFi full URL: ${this.client.defaults.baseURL}${endpoint}`,
      );

      this.logger.log(
        `PocketFi authentication configured: ${Boolean(
          this.client.defaults.headers.Authorization,
        )}`,
      );

      this.logger.log(
        `PocketFi business ID: ${this.businessId}`,
      );

      /*
       * Do NOT log secret keys, BVN, NIN, or authorization headers.
       */
      this.logger.log(
        `PocketFi request payload: ${JSON.stringify({
          first_name: params.firstName,
          last_name: params.lastName,
          phone: params.phone,
          email: params.email,
          businessId: this.businessId,
          bank: params.bank,
          has_nin: Boolean(params.nin),
          has_bvn: Boolean(params.bvn),
        })}`,
      );

      const response = await this.client.post(
        endpoint,
        payload,
      );

      this.logger.log(
        `PocketFi response status: ${response.status}`,
      );

      this.logger.log(
        `PocketFi response: ${JSON.stringify(response.data)}`,
      );

      const result = response.data;

      /*
       * PocketFi should return:
       *
       * {
       *   "status": true,
       *   "service": "CREATE_VIRTUAL_ACCOUNT",
       *   "businessId": 29492,
       *   "banks": [
       *     {
       *       "bankName": "kuda",
       *       "accountNumber": "7000245206",
       *       "accountName": "Ibrahim"
       *     }
       *   ]
       * }
       */

      if (!result?.status) {
        throw new BadRequestException(
          result?.message ??
            'PocketFi was unable to create the virtual account.',
        );
      }

      const account = result?.banks?.[0];

      if (!account) {
        this.logger.error(
          `PocketFi response did not contain a banks array item.`,
        );

        throw new InternalServerErrorException(
          'PocketFi did not return virtual account information.',
        );
      }

      if (!account.accountNumber) {
        this.logger.error(
          `PocketFi returned an account object without accountNumber: ${JSON.stringify(
            account,
          )}`,
        );

        throw new InternalServerErrorException(
          'PocketFi did not return an account number.',
        );
      }

      return {
        bankName: String(account.bankName ?? params.bank),
        accountNumber: String(account.accountNumber),
        accountName: String(
          account.accountName ?? params.firstName,
        ),
      };
    } catch (error: any) {
      /*
       * If this is already one of our Nest exceptions,
       * don't unnecessarily hide it behind another exception.
       */
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      const status = error?.response?.status;
      const responseData = error?.response?.data;

      this.logger.error(
        `PocketFi request failed.`,
      );

      this.logger.error(
        `PocketFi HTTP status: ${status ?? 'N/A'}`,
      );

      this.logger.error(
        `PocketFi error response: ${
          responseData
            ? JSON.stringify(responseData)
            : 'No response body'
        }`,
      );

      this.logger.error(
        `PocketFi error message: ${
          error?.message ?? 'Unknown error'
        }`,
      );

      /*
       * Do not log authorization headers or secret keys.
       */

      throw new BadRequestException(
        responseData?.message ??
          error?.message ??
          'Unable to create PocketFi virtual account.',
      );
    }
  }

  /*
  ============================================================
      VERIFY POCKETFI WEBHOOK SIGNATURE

      PocketFi webhook signature:
      HMAC-SHA512 of the RAW request body,
      using the PocketFi secret key .
  ============================================================
  */import {
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
    const secretKey = process.env.POCKETFI_SECRET_KEY;
    const businessId = process.env.POCKETFI_BUSINESS_ID;

    if (!secretKey) {
      throw new Error('POCKETFI_SECRET_KEY is missing.');
    }

    if (!businessId) {
      throw new Error('POCKETFI_BUSINESS_ID is missing.');
    }

    this.businessId = businessId;

    /*
     * PocketFi documentation:
     *
     * POST /api/v1/virtual-accounts/create
     *
     * Therefore the base URL must include /api/v1.
     */
    const baseURL =
      process.env.POCKETFI_BASE_URL ??
      'https://api.pocketfi.ng/api/v1';

    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.logger.log(`PocketFi base URL configured: ${baseURL}`);
    this.logger.log(
      `PocketFi API authentication configured: ${Boolean(secretKey)}`,
    );
    this.logger.log(`PocketFi business ID: ${businessId}`);
  }

  /*
  ============================================================
      CREATE STATIC VIRTUAL ACCOUNT

      PocketFi endpoint:

      POST /api/v1/virtual-accounts/create

      Full URL:

      https://api.pocketfi.ng/api/v1/virtual-accounts/create

      One permanent account can be created per customer/bank.
  ============================================================
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
    const payload = {
      first_name: params.firstName,
      last_name: params.lastName,
      phone: params.phone,
      email: params.email,
      businessId: this.businessId,
      bank: params.bank,

      ...(params.nin ? { nin: params.nin } : {}),
      ...(params.bvn ? { bvn: params.bvn } : {}),
    };

    const endpoint = '/virtual-accounts/create';

    try {
      this.logger.log(
        `Creating PocketFi ${params.bank} virtual account for ${params.email}`,
      );

      this.logger.log(
        `PocketFi base URL: ${this.client.defaults.baseURL}`,
      );

      this.logger.log(
        `PocketFi endpoint: POST ${endpoint}`,
      );

      this.logger.log(
        `PocketFi full URL: ${this.client.defaults.baseURL}${endpoint}`,
      );

      this.logger.log(
        `PocketFi authentication configured: ${Boolean(
          this.client.defaults.headers.Authorization,
        )}`,
      );

      this.logger.log(
        `PocketFi business ID: ${this.businessId}`,
      );

      /*
       * Do NOT log secret keys, BVN, NIN, or authorization headers.
       */
      this.logger.log(
        `PocketFi request payload: ${JSON.stringify({
          first_name: params.firstName,
          last_name: params.lastName,
          phone: params.phone,
          email: params.email,
          businessId: this.businessId,
          bank: params.bank,
          has_nin: Boolean(params.nin),
          has_bvn: Boolean(params.bvn),
        })}`,
      );

      const response = await this.client.post(
        endpoint,
        payload,
      );

      this.logger.log(
        `PocketFi response status: ${response.status}`,
      );

      this.logger.log(
        `PocketFi response: ${JSON.stringify(response.data)}`,
      );

      const result = response.data;

      /*
       * PocketFi should return:
       *
       * {
       *   "status": true,
       *   "service": "CREATE_VIRTUAL_ACCOUNT",
       *   "businessId": 29492,
       *   "banks": [
       *     {
       *       "bankName": "kuda",
       *       "accountNumber": "7000245206",
       *       "accountName": "Ibrahim"
       *     }
       *   ]
       * }
       */

      if (!result?.status) {
        throw new BadRequestException(
          result?.message ??
            'PocketFi was unable to create the virtual account.',
        );
      }

      const account = result?.banks?.[0];

      if (!account) {
        this.logger.error(
          `PocketFi response did not contain a banks array item.`,
        );

        throw new InternalServerErrorException(
          'PocketFi did not return virtual account information.',
        );
      }

      if (!account.accountNumber) {
        this.logger.error(
          `PocketFi returned an account object without accountNumber: ${JSON.stringify(
            account,
          )}`,
        );

        throw new InternalServerErrorException(
          'PocketFi did not return an account number.',
        );
      }

      return {
        bankName: String(account.bankName ?? params.bank),
        accountNumber: String(account.accountNumber),
        accountName: String(
          account.accountName ?? params.firstName,
        ),
      };
    } catch (error: any) {
      /*
       * If this is already one of our Nest exceptions,
       * don't unnecessarily hide it behind another exception.
       */
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      const status = error?.response?.status;
      const responseData = error?.response?.data;

      this.logger.error(
        `PocketFi request failed.`,
      );

      this.logger.error(
        `PocketFi HTTP status: ${status ?? 'N/A'}`,
      );

      this.logger.error(
        `PocketFi error response: ${
          responseData
            ? JSON.stringify(responseData)
            : 'No response body'
        }`,
      );

      this.logger.error(
        `PocketFi error message: ${
          error?.message ?? 'Unknown error'
        }`,
      );

      /*
       * Do not log authorization headers or secret keys.
       */

      throw new BadRequestException(
        responseData?.message ??
          error?.message ??
          'Unable to create PocketFi virtual account.',
      );
    }
  }

  /*
  ============================================================
      VERIFY POCKETFI WEBHOOK SIGNATURE

      PocketFi webhook signature:
      HMAC-SHA512 of the RAW request body,
      using the PocketFi secret key .
  ============================================================
  */

  verifyWebhook(
    payload: Buffer,
    signature: string,
  ): boolean {
    if (!signature) {
      return false;
    }

    const secretKey = process.env.POCKETFI_SECRET_KEY;

    if (!secretKey) {
      this.logger.error(
        'Cannot verify PocketFi webhook: POCKETFI_SECRET_KEY is missing.',
      );

      return false;
    }

    const hash = createHmac(
      'sha512',
      secretKey,
    )
      .update(payload)
      .digest('hex');

    return hash === signature;
  }
}

  verifyWebhook(
    payload: Buffer,
    signature: string,
  ): boolean {
    if (!signature) {
      return false;
    }

    const secretKey = process.env.POCKETFI_SECRET_KEY;

    if (!secretKey) {
      this.logger.error(
        'Cannot verify PocketFi webhook: POCKETFI_SECRET_KEY is missing.',
      );

      return false;
    }

    const hash = createHmac(
      'sha512',
      secretKey,
    )
      .update(payload)
      .digest('hex');

    return hash === signature;
  }
}