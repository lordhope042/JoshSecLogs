import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { WalletModule } from '../wallet/wallet.module';

import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PocketFiService } from './pocketfi.service';
import { VirtualAccountRepository } from './virtual-account.repository';

@Module({
  imports: [
    PrismaModule,
    WalletModule,
  ],

  controllers: [
    PaymentsController,
  ],

  providers: [
    PaymentsService,
    PocketFiService,
    VirtualAccountRepository,
  ],

  exports: [
    PaymentsService,
    PocketFiService,
  ],
})
export class PaymentsModule {}
