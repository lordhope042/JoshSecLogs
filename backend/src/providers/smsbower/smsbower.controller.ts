import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import { SmsBowerService } from './smsbower.service';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('provider/smsbower')
export class SmsBowerController {
  constructor(
    private readonly smsBower: SmsBowerService,
  ) {}

  /* ===============================
        HEALTH / BALANCE CHECK
  =============================== */

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('ping')
  ping() {
    return this.smsBower.ping();
  }

  /* ===============================
        COUNTRIES
  =============================== */

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('countries')
  getCountries() {
    return this.smsBower.getCountriesList();
  }

  /* ===============================
        SERVICES
  =============================== */

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('services')
  getServices() {
    return this.smsBower.getServicesList();
  }

  /* ===============================
        WHATSAPP PRICES
  =============================== */

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('whatsapp')
  getWhatsAppPrices() {
    return this.smsBower.getWhatsAppPrices();
  }

  /* ===============================
        RAW CATALOG
  =============================== */

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('raw-catalog')
  rawCatalog() {
    return this.smsBower.getPricesV2();
  }

  /* ===============================
        DIAGNOSTICS
  =============================== */

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('diagnostics')
  diagnostics() {
    return this.smsBower.diagnostics();
  }
}