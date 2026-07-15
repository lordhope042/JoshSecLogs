import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { WalletController } from './wallet.controller';
import { WalletRepository } from './wallet.repository';
import { WalletService } from './wallet.service';
import { PaystackService } from './providers/paystack.service';

@Module({
  imports: [PrismaModule],

  controllers: [WalletController],

  providers: [
    WalletRepository,
    WalletService,
    PaystackService,
  ],

  exports: [
    WalletRepository,
    WalletService,
    PaystackService,
  ],
})
export class WalletModule {}