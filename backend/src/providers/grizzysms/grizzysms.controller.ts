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
}
