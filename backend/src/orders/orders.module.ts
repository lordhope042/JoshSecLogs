import { Module } from '@nestjs/common';

import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

import { PrismaModule } from '../prisma/prisma.module';
import { FiveSimModule } from '../providers/fivesim/fivesim.module';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [
    PrismaModule,
    FiveSimModule,
  ],
  controllers: [OrdersController],
  providers: [JwtAuthGuard, OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}