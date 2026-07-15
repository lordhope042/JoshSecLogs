import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';

import { FiveSimModule } from '../providers/fivesim/fivesim.module';
import { WalletModule } from '../wallet/wallet.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    FiveSimModule,
    WalletModule,
  ],

  controllers: [MarketplaceController],

  providers: [MarketplaceService],

  exports: [MarketplaceService],
})
export class MarketplaceModule {}