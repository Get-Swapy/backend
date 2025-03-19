import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { WalletService } from 'src/wallet/wallet.service';

import { CreateUserDto } from './dtos/create-user.dto';
import { UserService } from './user.service';

@Controller('/users')
export class UserController {
  constructor(
    private readonly user: UserService,
    private readonly wallet: WalletService,
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

  // TODO: This should be a GET request
  @Post('/:userId/wallet/balances')
  public getBalance(@Param('userId') userId: string) {
    return this.wallet.getBalances(userId);
  }
}
