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

import { WalletService } from './wallet.service';

import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@Controller('wallet')
@UseGuards(AuthGuard('jwt'))
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
  ) {}

  /*
  =====================================
      WALLET BALANCE
  =====================================
  */

  @Get()
  async balance(@Req() req: any) {
    return {
      success: true,
      data: await this.walletService.balance(
        req.user.id,
      ),
    };
  }

  /*
  =====================================
      WALLET TRANSACTIONS
  =====================================
  */

  @Get('transactions')
  async transactions(@Req() req: any) {
    return {
      success: true,
      data: await this.walletService.transactions(
        req.user.id,
      ),
    };
  }

  /*
  =====================================
      SINGLE TRANSACTION
  =====================================
  */

  @Get('transactions/:reference')
  async transaction(
    @Req() req: any,
    @Param('reference') reference: string,
  ) {
    return {
      success: true,
      data: await this.walletService.transaction(
        req.user.id,
        reference,
      ),
    };
  }

  /*
  =====================================
      INITIALIZE DEPOSIT
  =====================================
  */

  /*
  =====================================
      VERIFY DEPOSIT
  =====================================
  */

  /*
  =====================================
      REFRESH WALLET
  =====================================
  */

  @Get('refresh')
  async refresh(@Req() req: any) {
    const wallet =
      await this.walletService.balance(
        req.user.id,
      );

    const transactions =
      await this.walletService.transactions(
        req.user.id,
      );

    return {
      success: true,
      data: {
        wallet,
        transactions,
      },
    };
  }
}