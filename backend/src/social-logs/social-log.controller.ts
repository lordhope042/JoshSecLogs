import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";

import * as client from "@prisma/client";

import { SocialLogService } from "./social-log.service";

import { CreateSocialLogDto } from "./dto/create-social-log.dto";
import { UpdateSocialLogDto } from "./dto/update-social-log.dto";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";

import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@Controller("social-logs")
export class SocialLogController {
  constructor(
    private readonly socialLogService: SocialLogService,
  ) {}

  /*
  =====================================
  PUBLIC — CATEGORY (marketplace tabs)
  GET /social-logs/categories        → 10-item grouped counts
  GET /social-logs/category/:category → listings for one tab
  =====================================
  */

  @Get("categories")
  async categories() {
    return this.socialLogService.categories();
  }

  @Get("category/:category")
  async findByCategory(
    @Param("category")
    category: client.SocialLogCategory,
  ) {
    return this.socialLogService.findByCategory(
      category,
    );
  }

  /*
  =====================================
  PUBLIC — PLATFORM (legacy / admin filtering)
  =====================================
  */

  @Get("platforms")
  async platforms() {
    return this.socialLogService.platforms();
  }

  @Get("platform/:platform")
  async findByPlatform(
    @Param("platform")
    platform: client.SocialPlatform,
  ) {
    return this.socialLogService.findByPlatform(
      platform,
    );
  }

  /*
  =====================================
  MARKETPLACE
  GET /social-logs
  GET /social-logs?platform=FACEBOOK
  =====================================
  */

  @Get()
  async findAll(
    @Query("platform")
    platform?: client.SocialPlatform,
  ) {
    return this.socialLogService.logs(
      platform,
    );
  }

  /*
  =====================================
  MY PURCHASES
  =====================================
  */

  @UseGuards(JwtAuthGuard)
  @Get("my-purchases")
  async myPurchases(
    @CurrentUser()
    user: client.User,
  ) {
    return this.socialLogService.getPurchasedAccounts(
      user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get("my-purchases/:id")
  async myPurchase(
    @Param("id")
    id: string,

    @CurrentUser()
    user: client.User,
  ) {
    return this.socialLogService.getPurchasedAccount(
      id,
      user.id,
    );
  }

  /*
  =====================================
  DETAILS
  =====================================
  */

  @Get(":id")
  async details(
    @Param("id")
    id: string,
  ) {
    return this.socialLogService.details(
      id,
    );
  }

  /*
  =====================================
  PURCHASE
  =====================================
  */

  @UseGuards(JwtAuthGuard)
  @Post(":id/purchase")
  async purchase(
    @Param("id")
    id: string,

    @CurrentUser()
    user: client.User,
  ) {
    return this.socialLogService.purchase(
      id,
      user.id,
    );
  }

  /*
  =====================================
  ADMIN
  =====================================
  */

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles("ADMIN")
  @Post()
  async create(
    @Body()
    dto: CreateSocialLogDto,
  ) {
    return this.socialLogService.create(
      dto,
    );
  }

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles("ADMIN")
  @Patch(":id")
  async update(
    @Param("id")
    id: string,

    @Body()
    dto: UpdateSocialLogDto,
  ) {
    return this.socialLogService.update(
      id,
      dto,
    );
  }

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles("ADMIN")
  @Patch(":id/sold/:buyerId")
  async markSold(
    @Param("id")
    id: string,

    @Param("buyerId")
    buyerId: string,
  ) {
    return this.socialLogService.markSold(
      id,
      buyerId,
    );
  }

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles("ADMIN")
  @Delete(":id")
  async delete(
    @Param("id")
    id: string,
  ) {
    return this.socialLogService.delete(
      id,
    );
  }
}