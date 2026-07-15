import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { WalletModule } from '../wallet/wallet.module';

import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentRepository } from './payment.repository';
import { PaystackService } from './paystack.service';

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
    PaymentRepository,
    PaystackService,
  ],

  exports: [
    PaymentsService,
    PaymentRepository,
    PaystackService,
  ],
})
export class PaymentsModule {}