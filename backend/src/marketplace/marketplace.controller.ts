import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { MarketplaceService } from './marketplace.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BuyNumberDto } from './dto/buy-number.dto';
import { RateLimit, RateLimitGuard } from '../common/guards/rate-limit.guard';

interface JwtRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('marketplace')
export class MarketplaceController {
  constructor(
    private readonly marketplaceService: MarketplaceService,
  ) {}

  /* ============================================================
                          PUBLIC
  ============================================================ */

  @Get('countries')
  @UseGuards(RateLimitGuard)
  @RateLimit(60, 60_000)
  countries(
    @Query('provider') provider?: 'FIVESIM' | 'GRIZZYSMS' | 'SMSBOWER',
  ) {
    return this.marketplaceService.countries(
      provider ?? 'FIVESIM',
    );
  }

  @Get('products/:country')
  @UseGuards(RateLimitGuard)
  @RateLimit(60, 60_000)
  products(
    @Param('country') country: string,
    @Query('provider') provider?: 'FIVESIM' | 'GRIZZYSMS' | 'SMSBOWER',
  ) {
    return this.marketplaceService.products(
      country,
      provider ?? 'FIVESIM',
    );
  }

  @Get('prices/:country')
  @UseGuards(RateLimitGuard)
  @RateLimit(30, 60_000)
  prices(
    @Param('country') country: string,
    @Query('provider') provider?: 'FIVESIM' | 'GRIZZYSMS' | 'SMSBOWER',
  ) {
    return this.marketplaceService.prices(
      country,
      provider ?? 'FIVESIM',
    );
  }

  /* ============================================================
                          BUY NUMBER
  ============================================================ */

  @UseGuards(JwtAuthGuard, RateLimitGuard)
  @RateLimit(8, 60_000)
  @Post('buy')
  buy(
    @Req() req: JwtRequest,
    @Body() dto: BuyNumberDto,
    @Headers('idempotency-key') idempotencyKey: string,
  ) {
    return this.marketplaceService.buy(
      req.user.id,
      dto,
      idempotencyKey,
    );
  }

  /* ============================================================
                          USER ORDERS
  ============================================================ */

  @UseGuards(JwtAuthGuard)
  @Get('orders')
  getOrders(
    @Req() req: JwtRequest,
  ) {
    return this.marketplaceService.getUserOrders(
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders/:id')
  getOrder(
    @Req() req: JwtRequest,
    @Param('id') orderId: string,
  ) {
    return this.marketplaceService.getOrder(
      req.user.id,
      orderId,
    );
  }

  /* ============================================================
                          SMS
  ============================================================ */

  @UseGuards(JwtAuthGuard)
  @Get('orders/:id/sms')
  sms(
    @Req() req: JwtRequest,
    @Param('id') orderId: string,
  ) {
    return this.marketplaceService.sms(
      req.user.id,
      orderId,
    );
  }

  /* ============================================================
                          FINISH
  ============================================================ */

  @UseGuards(JwtAuthGuard)
  @Post('orders/:id/finish')
  finish(
    @Req() req: JwtRequest,
    @Param('id') orderId: string,
  ) {
    return this.marketplaceService.finish(
      req.user.id,
      orderId,
    );
  }

  /* ============================================================
                          CANCEL
  ============================================================ */

  @UseGuards(JwtAuthGuard)
  @Post('orders/:id/cancel')
  cancel(
    @Req() req: JwtRequest,
    @Param('id') orderId: string,
  ) {
    return this.marketplaceService.cancel(
      req.user.id,
      orderId,
    );
  }

  /* ============================================================
                          BANs
  ============================================================ */

  @UseGuards(JwtAuthGuard)
  @Post('orders/:id/ban')
  ban(
    @Req() req: JwtRequest,
    @Param('id') orderId: string,
  ) {
    return this.marketplaceService.ban(
      req.user.id,
      orderId,
    );
  }

  /* ============================================================
                        SYNC ORDER
  ============================================================ */

  @UseGuards(JwtAuthGuard)
  @Get('orders/:id/sync')
  sync(
    @Req() req: JwtRequest,
    @Param('id') orderId: string,
  ) {
    return this.marketplaceService.syncOrder(
      req.user.id,
      orderId,
    );
  }
}
