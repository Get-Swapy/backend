import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';

import { CancelOrderDto } from './dtos/cancel-order.dto';
import { CreateP2pOrderDto } from './dtos/create-p2p-order.dto';
import { P2pOrderService } from './p2p-order.service';
import { transformBigIntToNumber } from '../shared/helpers.shared';

@Controller('/p2p-orders')
export class P2pOrderController {
  constructor(private readonly p2pOrderService: P2pOrderService) {}

  @Get('/:orderId')
  public getById(@Param('orderId') orderId: string) {
    const order = this.p2pOrderService.getById(orderId);
    return transformBigIntToNumber(order);
  }

  @Post('/')
  public async create(@Body() data: CreateP2pOrderDto) {
    const order = await this.p2pOrderService.create(data);

    return transformBigIntToNumber(order);
  }

  @Put('/:orderId/status/accept')
  public acceptOrder(@Param('orderId') orderId: string) {
    this.p2pOrderService.acceptOrder(orderId);
  }

  @Put('/:orderId/status/mark-as-paid')
  public markAsPaid(@Param('orderId') orderId: string) {
    this.p2pOrderService.markAsPaid(orderId);
  }

  @Put('/:orderId/status/confirm-payment')
  public confirmPayment(@Param('orderId') orderId: string) {
    this.p2pOrderService.confirmPayment(orderId);
  }

  @Put('/:orderId/status/cancel')
  public cancelOrder(
    @Param('orderId') orderId: string,
    @Body() data: CancelOrderDto,
  ) {
    this.p2pOrderService.cancelOrder(orderId, data.reason);
  }
}
