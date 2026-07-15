import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined in the .env file.');
    }

    super({
      adapter: new PrismaPg(databaseUrl),
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Connected to PostgreSQL');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}