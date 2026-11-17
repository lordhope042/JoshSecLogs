import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";

import { SocialLogController } from "./social-log.controller";
import { SocialLogService } from "./social-log.service";
import { SocialLogRepository } from "./social-log.repository";

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [PrismaModule],

  controllers: [SocialLogController],

  providers: [JwtAuthGuard, 
    SocialLogService,
    SocialLogRepository,
  ],

  exports: [
    SocialLogService,
    SocialLogRepository,
  ],
})
export class SocialLogModule {}