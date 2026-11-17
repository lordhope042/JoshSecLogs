import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';

import { FiveSimModule } from '../providers/fivesim/fivesim.module';
import { GrizzySmsModule } from '../providers/grizzysms/grizzysms.module';
import { SmsBowerModule } from '../providers/smsbower/smsbower.module';
import { WalletModule } from '../wallet/wallet.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    FiveSimModule,
    GrizzySmsModule,
    SmsBowerModule,
    WalletModule,
  ],

  controllers: [MarketplaceController],

  providers: [JwtAuthGuard, MarketplaceService, RateLimitGuard],

  exports: [MarketplaceService],
})
export class MarketplaceModule {}
