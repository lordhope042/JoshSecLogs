import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

import { PaymentsService } from './payments.service';
import { CreateVirtualAccountDto } from './dto/create-virtual-account.dto';

/*
=====================================
  EXTENDED REQUEST TYPE
=====================================
*/
interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // -----------------------------------------------------------------------
  // PUBLIC WEBHOOK — PocketFi calls this; must NOT be behind JWT guard.
  // -----------------------------------------------------------------------
  @Post('webhook')
  @HttpCode(200)
  async webhook(
    @Req() req: Request,
    @Headers() headers: Record<string, string>,
  ) {
    const signature =
      headers['http_pocketfi_signature'] ??
      headers['pocketfi-signature'] ??
      headers['x-pocketfi-signature'];

    const rawBody: Buffer =
      (req as any).rawBody ??
      Buffer.from(JSON.stringify(req.body ?? {}));

    return this.paymentsService.webhook(
      req.body,
      signature,
      rawBody,
    );
  }

  /*
  =====================================
      LIST VIRTUAL ACCOUNTS
  =====================================
  */
  @UseGuards(AuthGuard('jwt'))
  @Get('virtual-accounts')
  async listAccounts(@Req() req: RequestWithUser) {
    return this.paymentsService.listVirtualAccounts(req.user.id);
  }

  /*
  =====================================
      CREATE (OR FETCH EXISTING) VIRTUAL ACCOUNT
  =====================================
  */
  @UseGuards(AuthGuard('jwt'))
  @Post('virtual-accounts')
  async createAccount(
    @Req() req: RequestWithUser,
    @Body() dto: CreateVirtualAccountDto,
  ) {
    return this.paymentsService.getOrCreateVirtualAccount(
      {
        id: req.user.id,
        email: req.user.email,
      },
      dto.bank,
      dto.phone,
    );
  }
}