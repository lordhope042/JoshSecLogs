import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { WalletController } from './wallet.controller';
import { WalletRepository } from './wallet.repository';
import { WalletService } from './wallet.service';

// NOTE: The duplicate PaystackService that previously lived in
// `./providers/paystack.service.ts` has been removed.  It was dead code —
// registered in this module's providers/exports but never injected anywhere.
// The real Paystack integration lives in `src/payment/paystack.service.ts`
// and is owned by the PaymentsModule.

@Module({
  imports: [PrismaModule],

  controllers: [
    WalletController,
  ],

  providers: [
    WalletRepository,
    WalletService,
  ],

  exports: [
    WalletRepository,
    WalletService,
  ],
})
export class WalletModule {}
