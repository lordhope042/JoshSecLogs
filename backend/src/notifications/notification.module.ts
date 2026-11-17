import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";

import { NotificationController } from "./notification.controller";
import { NotificationService } from "./notification.service";
import { NotificationRepository } from "./notification.repository";

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [PrismaModule],

  controllers: [NotificationController],

  providers: [JwtAuthGuard, NotificationService, NotificationRepository],

  exports: [NotificationService],
})
export class NotificationModule {}
