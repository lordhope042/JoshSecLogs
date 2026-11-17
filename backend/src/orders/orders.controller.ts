import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';

import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
  ) {}

  @Get()
  getOrders(@Req() req) {
    return this.ordersService.getAllOrders(
      req.user.id,
    );
  }

  @Get(':id')
  getOrder(
    @Req() req,
    @Param('id') id: string,
  ) {
    return this.ordersService.getOrderById(
      req.user.id,
      id,
    );
  }
}