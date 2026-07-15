import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";

import { AdminRepository } from "./admin.repository";

@Injectable()
export class AdminService {
  constructor(
    private readonly repository: AdminRepository,
  ) {}

  /*
  =====================================
      DASHBOARD
  =====================================
  */

  async dashboard() {
    const [
      users,
      wallet,
      orders,
      activeOrders,
      revenue,
      payments,
      socialLogs,
      availableLogs,
    ] = await this.repository.dashboard();

    return {
      users,
      walletBalance: Number(wallet._sum.balance ?? 0),
      orders,
      activeOrders,
      revenue: Number(revenue._sum.amount ?? 0),
      payments,
      socialLogs,
      availableLogs,
    };
  }

  /*
  =====================================
      USERS
  =====================================
  */

  users() {
    return this.repository.users();
  }

  async user(id: string) {
    const user = await this.repository.user(id);

    if (!user) {
      throw new NotFoundException("User not found.");
    }

    return user;
  }

  async updateUserRole(id: string, role: "USER" | "ADMIN") {
    const user = await this.repository.user(id);

    if (!user) {
      throw new NotFoundException("User not found.");
    }

    if (user.role === role) {
      throw new BadRequestException(`User is already a ${role}.`);
    }

    return this.repository.updateUser(id, { role });
  }

  async updateUserStatus(id: string, isActive: boolean) {
    const user = await this.repository.user(id);

    if (!user) {
      throw new NotFoundException("User not found.");
    }

    if (user.isActive === isActive) {
      throw new BadRequestException(
        `User is already ${isActive ? "active" : "suspended"}.`,
      );
    }

    return this.repository.updateUser(id, { isActive });
  }

  /*
  =====================================
      ORDERS
  =====================================
  */

  orders() {
    return this.repository.orders();
  }

  /*
  =====================================
      PAYMENTS
  =====================================
  */

  payments() {
    return this.repository.payments();
  }

  /*
  =====================================
      TRANSACTIONS
  =====================================
  */

  transactions() {
    return this.repository.transactions();
  }
}