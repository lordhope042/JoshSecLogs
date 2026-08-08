import { Injectable, NotFoundException } from "@nestjs/common";

import { NotificationRepository } from "./notification.repository";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { UpdateNotificationDto } from "./dto/update-notification.dto";

@Injectable()
export class NotificationService {
  constructor(private readonly repository: NotificationRepository) {}

  /*
  =====================================
      ADMIN — CRUD
  =====================================
  */

  create(dto: CreateNotificationDto) {
    return this.repository.create({
      title: dto.title,
      message: dto.message,
      active: dto.active ?? true,
      telegramUrl: dto.telegramUrl,
      whatsappUrl: dto.whatsappUrl,
    });
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const notification = await this.repository.findOne(id);

    if (!notification) {
      throw new NotFoundException("Notification not found");
    }

    return notification;
  }

  async update(id: string, dto: UpdateNotificationDto) {
    // Ensures a 404 instead of a Prisma P2025 error if the id is bad.
    await this.findOne(id);

    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.repository.remove(id);
  }

  /*
  =====================================
      PUBLIC — ACTIVE NOTIFICATION
  =====================================
  Every notification is entered the same way by the admin — there's no
  "type" to pick. The single latest active notification is shown to
  everyone; whether the frontend renders it as a first-time "welcome" or
  a "welcome back" card is decided purely by that viewer's own login
  context (isFirstLogin), not by anything stored on the notification.
  Returns null if nothing is active.
  */

  findActive() {
    return this.repository.findLatestActive();
  }
}
