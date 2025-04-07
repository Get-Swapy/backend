import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { P2pOrderService } from '../p2p-order/p2p-order.service';
import { WalletService } from '../wallet/wallet.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserService } from './user.service';

@Controller('/users')
export class UserController {
  constructor(
    private readonly user: UserService,
    private readonly wallet: WalletService,
    private readonly p2pOrderService: P2pOrderService,
  ) {}

  @Post('/')
  public create(@Body() data: CreateUserDto) {
    return this.user.create(data);
  }

  @Get('/:userId')
  public getById(@Param('userId') userId: string) {
    return this.user.getById(userId);
  }

  @Get('/external/:externalId')
  public getByExternalId(@Param('externalId') externalId: string) {
    return this.user.getByExternalId(externalId);
  }

  @Get('/:userId/orders')
  public getUserOrders(
    @Param('userId') userId: string,
    @Query('role') role?: 'seller' | 'buyer' | 'all',
  ) {
    if (role === 'seller') {
      return this.p2pOrderService.getBySellerId(userId);
    } else if (role === 'buyer') {
      return this.p2pOrderService.getByBuyerId(userId);
    } else {
      const sellerOrders = this.p2pOrderService.getBySellerId(userId);
      const buyerOrders = this.p2pOrderService.getByBuyerId(userId);

      return [...sellerOrders, ...buyerOrders];
    }
  }

  @Post('/:userId/wallet/balances')
  public async getBalance(@Param('userId') userId: string) {
    try {
      return await this.wallet.getBalances(userId);
    } catch (error) {
      throw error;
    }
  }
}
