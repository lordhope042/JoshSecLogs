import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { GrizzySmsController } from './grizzysms.controller';
import { GrizzySmsService } from './grizzysms.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [GrizzySmsController],
  providers: [GrizzySmsService],
  exports: [GrizzySmsService],
})
export class GrizzySmsModule {}
