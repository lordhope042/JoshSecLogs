import { Controller, Get, UseGuards } from '@nestjs/common';

import { GrizzySmsService } from './grizzysms.service';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('provider/grizzysms')
export class GrizzySmsController {
  constructor(private readonly grizzySms: GrizzySmsService) {}

  /* ===============================
        HEALTH / BALANCE CHECK
  =============================== */

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('ping')
  ping() {
    return this.grizzySms.ping();
  }

  /* ===============================
        RAW CATALOG (for mapping)
  =============================== */

  /**
   * Dumps the full raw getPricesV2 response — every country id and
   * service code GrizzySMS currently has stock for, with no name
   * translation applied. Use this to manually cross-reference against
   * GrizzySMS's own country pages / support to build out
   * `grizzyCountryNames` / `grizzyServiceNames` in marketplace.service.ts.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('raw-catalog')
  rawCatalog() {
    return this.grizzySms.getPricesV2();
  }
}
