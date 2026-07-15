import { Module } from '@nestjs/common';

import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

import { PrismaModule } from '../prisma/prisma.module';
import { FiveSimModule } from '../providers/fivesim/fivesim.module';

@Module({
  imports: [
    PrismaModule,
    FiveSimModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}