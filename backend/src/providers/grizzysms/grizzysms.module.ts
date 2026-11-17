import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { GrizzySmsController } from './grizzysms.controller';
import { GrizzySmsService } from './grizzysms.service';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule, HttpModule, ConfigModule],
  controllers: [GrizzySmsController],
  providers: [JwtAuthGuard, GrizzySmsService],
  exports: [GrizzySmsService],
})
export class GrizzySmsModule {}
