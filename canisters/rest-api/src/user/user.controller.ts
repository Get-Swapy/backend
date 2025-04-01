import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { WalletService } from 'src/wallet/wallet.service';

import { CreateUserDto } from './dtos/create-user.dto';
import { TransferToUserDto } from './dtos/transfer-to-user.dto';
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
  public async getBalance(@Param('userId') userId: string) {
    try {
      return await this.wallet.getBalances(userId);
    } catch (error) {
      // The exception filter will handle the error
      throw error;
    }
  }

  @Post('/:userId/wallet/transfer')
  public async transferToUser(
    @Param('userId') userId: string,
    @Body() data: TransferToUserDto,
  ) {
    try {
      return await this.wallet.transferToUser({
        from: userId,
        to: data.userId,
        token: data.token,
        amount: data.amount,
      });
    } catch (error) {
      // The exception filter will handle the error
      throw error;
    }
  }
}
