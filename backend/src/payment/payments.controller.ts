import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

import { PaymentsService } from './payments.service';

import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

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
  // PUBLIC WEBHOOK — Paystack calls this; must NOT be behind JWT guard.
  // The raw request body is required for HMAC signature verification.
  // -----------------------------------------------------------------------
  @Post('webhook')
  @HttpCode(200)
  async webhook(
    @Req() req: Request,
    @Headers('x-paystack-signature') signature: string,
  ) {
    // req.body is the parsed JSON; req.rawBody (if available) is the raw
    // buffer needed for an exact HMAC match.
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
      INITIALIZE PAYMENT
  =====================================
  */
  @UseGuards(AuthGuard('jwt'))
  @Post('initialize')
  async initialize(
    @Req() req: RequestWithUser,
    @Body() dto: InitializePaymentDto,
  ) {
    return this.paymentsService.initialize(
      {
        id: req.user.id,
        email: req.user.email,
      },
      dto.amount,
    );
  }

  /*
  =====================================
      VERIFY PAYMENT
  =====================================
  */
  @UseGuards(AuthGuard('jwt'))
  @Post('verify')
  async verify(
    @Req() req: RequestWithUser,
    @Body() dto: VerifyPaymentDto,
  ) {
    return this.paymentsService.verify(
      req.user.id,
      dto.reference,
    );
  }

  /*
  =====================================
      PAYMENT HISTORY
  =====================================
  */
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async history(@Req() req: RequestWithUser) {
    return this.paymentsService.history(req.user.id);
  }

  /*
  =====================================
      SINGLE PAYMENT
  =====================================
  */
  @UseGuards(AuthGuard('jwt'))
  @Get(':reference')
  async payment(
    @Req() req: RequestWithUser,
    @Param('reference') reference: string,
  ) {
    return this.paymentsService.payment(req.user.id, reference);
  }
}