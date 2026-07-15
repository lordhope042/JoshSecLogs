import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";

import { SocialLogController } from "./social-log.controller";
import { SocialLogService } from "./social-log.service";
import { SocialLogRepository } from "./social-log.repository";

@Module({
  imports: [PrismaModule],

  controllers: [SocialLogController],

  providers: [
    SocialLogService,
    SocialLogRepository,
  ],

  exports: [
    SocialLogService,
    SocialLogRepository,
  ],
})
export class SocialLogModule {}