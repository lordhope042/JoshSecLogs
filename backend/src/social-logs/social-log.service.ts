import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import {
  SocialLogStatus,
  SocialPlatform,
  SocialLogCategory,
} from "@prisma/client";

import { SocialLogRepository } from "./social-log.repository";

import { CreateSocialLogDto } from "./dto/create-social-log.dto";
import { UpdateSocialLogDto } from "./dto/update-social-log.dto";

@Injectable()
export class SocialLogService {
  constructor(
    private readonly repository: SocialLogRepository,
  ) {}

  /*
  =====================================
  PUBLIC — CATEGORY (marketplace tabs)
  =====================================
  */

  async categories() {
    return this.repository.categories();
  }

  async findByCategory(
    category: SocialLogCategory,
  ) {
    return this.repository.findByCategory(
      category,
    );
  }

  /*
  =====================================
  PUBLIC — PLATFORM (legacy / admin filtering)
  =====================================
  */

  async platforms() {
    return this.repository.platforms();
  }

  async findAll() {
    return this.repository.findAll();
  }

  async logs(
    platform?: SocialPlatform,
  ) {
    return this.repository.findMany(
      platform,
    );
  }

  async findByPlatform(
    platform: SocialPlatform,
  ) {
    return this.repository.findByPlatform(
      platform,
    );
  }

  async details(id: string) {
    return this.findOne(id);
  }

  async findOne(id: string) {
    const log =
      await this.repository.findById(id);

    if (!log) {
      throw new NotFoundException(
        "Social account not found.",
      );
    }

    return log;
  }

  /*
  =====================================
  ADMIN
  =====================================
  */

  async create(
    dto: CreateSocialLogDto,
  ) {
    return this.repository.create(dto);
  }

  async update(
    id: string,
    dto: UpdateSocialLogDto,
  ) {
    await this.findOne(id);

    return this.repository.update(
      id,
      dto,
    );
  }

  async delete(id: string) {
    await this.findOne(id);

    await this.repository.delete(id);

    return {
      success: true,
      message:
        "Social account deleted successfully.",
    };
  }

  /*
  =====================================
  PURCHASE
  =====================================
  */

  async purchase(
    id: string,
    userId: string,
  ) {
    const log =
      await this.findOne(id);

    if (
      log.status ===
      SocialLogStatus.SOLD
    ) {
      throw new BadRequestException(
        "This account has already been sold.",
      );
    }

    return this.repository.purchase(
      id,
      userId,
    );
  }

  /*
  =====================================
  BUYER PURCHASES
  =====================================
  */

  async getPurchasedAccounts(
    userId: string,
  ) {
    return this.repository.getPurchasedAccounts(
      userId,
    );
  }

  async getPurchasedAccount(
    id: string,
    userId: string,
  ) {
    const account =
      await this.repository.getPurchasedAccount(
        id,
        userId,
      );

    if (!account) {
      throw new NotFoundException(
        "Purchased account not found.",
      );
    }

    return account;
  }

  /*
  =====================================
  ADMIN
  =====================================
  */

  async markSold(
    id: string,
    buyerId: string,
  ) {
    const log =
      await this.findOne(id);

    if (
      log.status ===
      SocialLogStatus.SOLD
    ) {
      throw new BadRequestException(
        "This account has already been sold.",
      );
    }

    return this.repository.markSold(
      id,
      buyerId,
    );
  }
}