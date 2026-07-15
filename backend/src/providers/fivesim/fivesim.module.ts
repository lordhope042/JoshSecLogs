import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { FiveSimController } from './fivesim.controller';
import { FiveSimService } from './fivesim.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  controllers: [
    FiveSimController,
  ],
  providers: [
    FiveSimService,
  ],
  exports: [
    FiveSimService,
  ],
})
export class FiveSimModule {}