import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseEnumPipe,
  ParseUUIDPipe,
} from "@nestjs/common";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

import { AdminService } from "./admin.service";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
  ) {}

  /*
  =====================================
      DASHBOARD
  =====================================
  */

  @Get("dashboard")
  dashboard() {
    return this.adminService.dashboard();
  }

  /*
  =====================================
      USERS
  =====================================
  */

  @Get("users")
  users() {
    return this.adminService.users();
  }

  @Get("users/:id")
  user(
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.adminService.user(id);
  }

  @Patch("users/:id/role")
  updateRole(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(
      "role",
      new ParseEnumPipe(["USER", "ADMIN"]),
    )
    role: "USER" | "ADMIN",
  ) {
    return this.adminService.updateUserRole(
      id,
      role,
    );
  }

  @Patch("users/:id/status")
  updateStatus(
    @Param("id", ParseUUIDPipe) id: string,
    @Body("isActive") isActive: boolean,
  ) {
    return this.adminService.updateUserStatus(
      id,
      isActive,
    );
  }

  /*
  =====================================
      ORDERS
  =====================================
  */

  @Get("orders")
  orders() {
    return this.adminService.orders();
  }

  /*
  =====================================
      PAYMENTS
  =====================================
  */

  @Get("payments")
  payments() {
    return this.adminService.payments();
  }

  /*
  =====================================
      TRANSACTIONS
  =====================================
  */

  @Get("transactions")
  transactions() {
    return this.adminService.transactions();
  }
}