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
@UseGuards(AuthGuard('jwt'))
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /*
  =====================================
      INITIALIZE PAYMENT
  =====================================
  */
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
  @Get()
  async history(@Req() req: RequestWithUser) {
    return this.paymentsService.history(req.user.id);
  }

  /*
  =====================================
      SINGLE PAYMENT
  =====================================
  */
  @Get(':reference')
  async payment(
    @Req() req: RequestWithUser,
    @Param('reference') reference: string,
  ) {
    return this.paymentsService.payment(req.user.id, reference);
  }
}