import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';

import { CreateP2pOrderDto } from './dtos/create-p2p-order.dto';
import { UpdateOrderStatusDto } from './dtos/update-order-status.dto';
import { P2pOrderService } from './p2p-order.service';

@Controller('/p2p-orders')
export class P2pOrderController {
  constructor(private readonly p2pOrderService: P2pOrderService) {}

  @Get('/:orderId')
  public getById(@Param('orderId') orderId: string) {
    return this.p2pOrderService.getById(orderId);
  }

  @Post('/')
  public create(@Body() data: CreateP2pOrderDto) {
    return this.p2pOrderService.create({
      ...data,
    });
  }

  @Put('/:orderId/status')
  public updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() data: UpdateOrderStatusDto,
  ) {
    switch (data.status) {
      case 'PENDING_PAYMENT':
        return this.p2pOrderService.confirmOrder({ orderId });

      case 'PAYMENT_MARKED':
        return this.p2pOrderService.markAsPaid({ orderId });

      case 'COMPLETED':
        return this.p2pOrderService.confirmPayment({ orderId });

      case 'CANCELLED':
        return this.p2pOrderService.cancelOrder(orderId, data.reason);

      default:
        throw new Error(`Cannot update order to status: ${data.status}`);
    }
  }
}
