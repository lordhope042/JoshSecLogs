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

interface RequestWithUser extends Request {
  user: { id: string; email: string };
}

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('webhook')
  @HttpCode(200)
  async webhook(
    @Req() req: Request,
    @Headers() headers: Record<string, string>,
  ) {
    const signature =
      headers['x-pocketfi-signature'] ??
      headers['pocketfi-signature'] ??
      headers['http_pocketfi-signature'] ??
      headers['x-webhook-signature'];

    const rawBody: Buffer =
      (req as any).rawBody ??
      Buffer.from(JSON.stringify(req.body ?? {}));

    return this.paymentsService.webhook(req.body, signature, rawBody);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('virtual-accounts')
  async listAccounts(@Req() req: RequestWithUser) {
    return this.paymentsService.listVirtualAccounts(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('virtual-accounts')
  async createAccount(
    @Req() req: RequestWithUser,
    @Body() dto: CreateVirtualAccountDto,
  ) {
    return this.paymentsService.getOrCreateVirtualAccount(
      { id: req.user.id, email: req.user.email },
      dto.bank,
      dto.phone,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('manual-reconcile')
  async manualReconcile(
    @Body() body: { reference: string; accountNumber: string; amount: number },
  ) {
    return this.paymentsService.manualReconcile(
      body.reference,
      body.accountNumber,
      body.amount,
    );
  }
}