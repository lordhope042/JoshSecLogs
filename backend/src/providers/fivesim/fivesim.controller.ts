import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

import { FiveSimService } from './fivesim.service';

@Controller('provider/fivesim')
export class FiveSimController {
  constructor(
    private readonly fiveSim: FiveSimService,
  ) {}

  /* =====================================
                  ACCOUNT
  ===================================== */

  @Get('profile')
  profile() {
    return this.fiveSim.profile();
  }

  /* =====================================
                COUNTRIES
  ===================================== */

  @Get('countries')
  countries() {
    return this.fiveSim.countries();
  }

  /* =====================================
                SERVICES
  ===================================== */

  @Get('products/:country/:activationType')
  products(
    @Param('country') country: string,
    @Param('activationType')
    activationType: string,
  ) {
    return this.fiveSim.products(
      country,
      activationType,
    );
  }

  /* =====================================
            MARKET PRICES
  ===================================== */

  @Get('prices/:country')
  prices(
    @Param('country') country: string,
  ) {
    return this.fiveSim.prices(country);
  }

  /* =====================================
                BUY NUMBER
  ===================================== */

  @Post('buy')
  buy(
    @Body()
    body: {
      country: string;
      activationType: string;
      service: string;
    },
  ) {
    return this.fiveSim.buy(
      body.country,
      body.activationType,
      body.service,
    );
  }

  /* =====================================
                ORDER
  ===================================== */

  @Get('check/:id')
  check(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.fiveSim.check(id);
  }

  @Get('finish/:id')
  finish(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.fiveSim.finish(id);
  }

  @Get('cancel/:id')
  cancel(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.fiveSim.cancel(id);
  }

  @Get('ban/:id')
  ban(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.fiveSim.ban(id);
  }

  /* =====================================
            ACTIVE ORDERS
  ===================================== */

  @Get('orders')
  activeOrders() {
    return this.fiveSim.activeOrders();
  }

  /* =====================================
                  SMS
  ===================================== */

  @Get('sms/:id')
  sms(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.fiveSim.sms(id);
  }

  /* =====================================
            ORDER STATUS
  ===================================== */

  @Get('status/:id')
  status(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.fiveSim.check(id);
  }

  /* =====================================
                HEALTH
  ===================================== */

  @Get('ping')
  ping() {
    return this.fiveSim.ping();
  }
}