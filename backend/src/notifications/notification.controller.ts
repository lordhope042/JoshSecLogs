import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";

import { NotificationService } from "./notification.service";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { UpdateNotificationDto } from "./dto/update-notification.dto";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller("notifications")
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /*
  =====================================
  ADMIN — CREATE
  POST /notifications
  =====================================
  */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Post()
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationService.create(dto);
  }

  /*
  =====================================
  ADMIN — LIST ALL
  GET /notifications
  =====================================
  */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Get()
  findAll() {
    return this.notificationService.findAll();
  }

  /*
  =====================================
  PUBLIC (any logged-in user) — ACTIVE NOTIFICATION
  GET /notifications/active
  Fetched by the dashboard welcome modal right after login. The same
  active notification is returned to everyone — the frontend decides
  how to present it (new-user vs welcome-back layout) based on that
  viewer's own login context, not anything on this record.
  Declared before GET /:id so "active" isn't swallowed as a uuid param.
  =====================================
  */
  @UseGuards(JwtAuthGuard)
  @Get("active")
  getActive() {
    return this.notificationService.findActive();
  }

  /*
  =====================================
  ADMIN — GET ONE
  GET /notifications/:id
  =====================================
  */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.notificationService.findOne(id);
  }

  /*
  =====================================
  ADMIN — UPDATE (edit content or toggle active)
  PATCH /notifications/:id
  =====================================
  */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Patch(":id")
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateNotificationDto,
  ) {
    return this.notificationService.update(id, dto);
  }

  /*
  =====================================
  ADMIN — DELETE
  DELETE /notifications/:id
  =====================================
  */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Delete(":id")
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.notificationService.remove(id);
  }
}
