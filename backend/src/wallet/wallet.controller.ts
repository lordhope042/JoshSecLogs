import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
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

  /*
  =====================================
      WALLET TRANSACTIONS  (PAGINATED)

      FIX: accept optional `page` and `limit` query params and forward them
      to the service.  When the params are present the response shape is
      `{ success, data, meta }` (meta = { page, limit, total, totalPages,
      hasNext, hasPrev }); when omitted the response keeps the legacy
      `{ success, data: [...] }` shape so existing callers don't break.

      Defaults applied in the service/repository: page=1, limit=20, limit
      capped at 100.
  =====================================
  */

  @Get('transactions')
  async transactions(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page !== undefined ? Number(page) : undefined;
    const limitNum =
      limit !== undefined ? Number(limit) : undefined;

    const result = await this.walletService.transactions(
      req.user.id,
      pageNum,
      limitNum,
    );

    // Paginated path → { success, data, meta }
    if (
      pageNum !== undefined &&
      limitNum !== undefined &&
      result &&
      typeof result === 'object' &&
      'meta' in (result as any)
    ) {
      return {
        success: true,
        data: (result as any).data,
        meta: (result as any).meta,
      };
    }

    // Legacy path → { success, data: [...] }
    return { success: true, data: result };
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