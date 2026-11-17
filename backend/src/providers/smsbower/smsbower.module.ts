import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { SmsBowerController } from './smsbower.controller';
import { SmsBowerService } from './smsbower.service';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule, HttpModule, ConfigModule],
  controllers: [SmsBowerController],
  providers: [JwtAuthGuard, SmsBowerService],
  exports: [SmsBowerService],
})
export class SmsBowerModule {}
