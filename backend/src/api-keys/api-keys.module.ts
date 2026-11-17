import { Module } from '@nestjs/common';

import { WalletModule } from '../wallet/wallet.module';

import { ApiKeysController } from './api-keys.controller';
import { ApiKeysService } from './api-keys.service';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, WalletModule],
  controllers: [ApiKeysController],
  providers: [JwtAuthGuard, ApiKeysService, RateLimitGuard],
  exports: [ApiKeysService],
})
export class ApiKeysModule {}
