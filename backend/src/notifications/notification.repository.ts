import { Injectable } from "@nestjs/common";

import { Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  /*
  =====================================
      ADMIN — CRUD
  =====================================
  */

  create(data: Prisma.NotificationCreateInput) {
    return this.prisma.notification.create({ data });
  }

  findAll() {
    return this.prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  findOne(id: string) {
    return this.prisma.notification.findUnique({ where: { id } });
  }

  update(id: string, data: Prisma.NotificationUpdateInput) {
    return this.prisma.notification.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.notification.delete({ where: { id } });
  }

  /*
  =====================================
      PUBLIC — ACTIVE NOTIFICATION
  =====================================
  */

  findLatestActive() {
    return this.prisma.notification.findFirst({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });
  }
}
