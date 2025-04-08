import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';

import { transformBigIntToNumber } from '../shared/helpers.shared';
import { CreateP2pOrderDto } from './dtos/create-p2p-order.dto';
import { UpdateOrderStatusDto } from './dtos/update-order-status.dto';
import { P2pOrderService } from './p2p-order.service';

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

  @Put('/:orderId/status')
  public updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() data: UpdateOrderStatusDto,
  ) {
    switch (data.status) {
      case 'PENDING_PAYMENT':
        return transformBigIntToNumber(
          this.p2pOrderService.confirmOrder({ orderId }),
        );

      case 'PAYMENT_MARKED':
        return transformBigIntToNumber(
          this.p2pOrderService.markAsPaid({ orderId }),
        );

      case 'COMPLETED':
        return transformBigIntToNumber(
          this.p2pOrderService.confirmPayment({ orderId }),
        );

      case 'CANCELLED':
        return transformBigIntToNumber(
          this.p2pOrderService.cancelOrder(orderId, data.reason),
        );

      default:
        throw new Error(`Cannot update order to status: ${data.status}`);
    }
  }
}
