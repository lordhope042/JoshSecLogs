import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";

import { AdminRepository } from "./admin.repository";

@Injectable()
export class AdminService {
  constructor(private readonly repository: AdminRepository) {}

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

  async refundOrder(id: string) {
    const order = await this.repository.orderById(id);

    if (!order) {
      throw new NotFoundException("Order not found.");
    }

    if (order.refundedAt) {
      throw new BadRequestException("This order has already been refunded.");
    }

    if (!order.user.wallet) {
      throw new BadRequestException(
        "This user has no wallet to refund into.",
      );
    }

    return this.repository.refundOrder(order);
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

  async refundTransaction(id: string) {
    const transaction = await this.repository.transactionById(id);

    if (!transaction) {
      throw new NotFoundException("Transaction not found.");
    }

    if (transaction.refundedAt) {
      throw new BadRequestException(
        "This transaction has already been reversed.",
      );
    }

    if (transaction.type === "REFUND") {
      throw new BadRequestException(
        "A refund transaction cannot itself be reversed.",
      );
    }

    if (!transaction.user.wallet) {
      throw new BadRequestException(
        "This user has no wallet to adjust.",
      );
    }

    if (transaction.balanceBefore === null || transaction.balanceAfter === null) {
      throw new BadRequestException(
        "This transaction has no recorded balance change to reverse.",
      );
    }

    // Ground truth is the balance delta, not the type/status label — a
    // transaction can be marked FAILED yet still have actually moved money
    // before the failure was detected. Whatever the label says, if the
    // balance changed, it's reversible in the opposite direction.
    const delta = transaction.balanceAfter.minus(transaction.balanceBefore);

    if (delta.equals(0)) {
      throw new BadRequestException(
        "This transaction did not change the wallet balance, so there's nothing to reverse.",
      );
    }

    const isCreditReversal = delta.greaterThan(0);
    const amount = delta.abs();

    if (isCreditReversal && transaction.user.wallet.balance.lessThan(amount)) {
      throw new BadRequestException(
        "User's current wallet balance is lower than this credit — reversing it would take the balance negative.",
      );
    }

    return this.repository.refundTransaction(transaction, amount, isCreditReversal);
  }
}