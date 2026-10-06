import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { SmsBowerController } from './smsbower.controller';
import { SmsBowerService } from './smsbower.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [SmsBowerController],
  providers: [SmsBowerService],
  exports: [SmsBowerService],
})
export class SmsBowerModule {}
