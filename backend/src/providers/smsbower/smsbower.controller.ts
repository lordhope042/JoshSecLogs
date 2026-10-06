import { Controller, Get, UseGuards } from '@nestjs/common';

import { SmsBowerService } from './smsbower.service';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('provider/smsbower')
export class SmsBowerController {
  constructor(private readonly smsBower: SmsBowerService) {}

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
        RAW CATALOG (for mapping)
  =============================== */

  /**
   * Dumps the full raw getPricesV2 response — every country id and
   * service code SMSBower currently has stock for, with no name
   * translation applied. Use this the same way as GrizzySMS's
   * raw-catalog endpoint: cross-reference against SMSBower's own
   * country pages / support to build out any name maps you need in
   * marketplace.service.ts.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('raw-catalog')
  rawCatalog() {
    return this.smsBower.getPricesV2();
  }
}
