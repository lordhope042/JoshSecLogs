import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RateLimit, RateLimitGuard } from '../common/guards/rate-limit.guard';

@Controller('api-keys')
@UseGuards(JwtAuthGuard)
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Get()
  list(@Request() req: any) {
    return this.apiKeysService.list(req.user.sub);
  }

  @Post()
  @UseGuards(RateLimitGuard)
  @RateLimit(3, 60_000)
  create(@Request() req: any, @Body() dto: CreateApiKeyDto) {
    return this.apiKeysService.create(req.user.sub, dto);
  }

  @Patch(':id/toggle')
  toggle(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.apiKeysService.toggle(req.user.sub, id);
  }

  @Delete(':id')
  remove(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.apiKeysService.remove(req.user.sub, id);
  }
}
