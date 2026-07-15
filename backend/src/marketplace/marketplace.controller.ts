import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { MarketplaceService } from './marketplace.service';
import { BuyNumberDto } from './dto/buy-number.dto';

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
  countries() {
    return this.marketplaceService.countries();
  }

  @Get('products/:country')
  products(
    @Param('country') country: string,
  ) {
    return this.marketplaceService.products(
      country,
    );
  }

  @Get('prices/:country')
  prices(
    @Param('country') country: string,
  ) {
    return this.marketplaceService.prices(
      country,
    );
  }

  /* ============================================================
                          BUY NUMBER
  ============================================================ */

  @UseGuards(AuthGuard('jwt'))
  @Post('buy')
  buy(
    @Req() req: JwtRequest,
    @Body() dto: BuyNumberDto,
  ) {
    return this.marketplaceService.buy(
      req.user.id,
      dto,
    );
  }

  /* ============================================================
                          USER ORDERS
  ============================================================ */

  @UseGuards(AuthGuard('jwt'))
  @Get('orders')
  getOrders(
    @Req() req: JwtRequest,
  ) {
    return this.marketplaceService.getUserOrders(
      req.user.id,
    );
  }

  @UseGuards(AuthGuard('jwt'))
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

  @UseGuards(AuthGuard('jwt'))
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

  @UseGuards(AuthGuard('jwt'))
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

  @UseGuards(AuthGuard('jwt'))
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
                          BAN
  ============================================================ */

  @UseGuards(AuthGuard('jwt'))
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

  @UseGuards(AuthGuard('jwt'))
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