import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { CreateUserDto } from './dtos/create-user.dto';
import { UserService } from './user.service';

@Controller('/users')
export class UserController {
  constructor(private readonly user: UserService) {}

  @Post('/')
  public createUser(@Body() data: CreateUserDto) {
    return this.user.create(data);
  }

  @Get('/:userId')
  public getUserById(@Param('userId') userId: string) {
    return this.user.getById(userId);
  }

  @Get('/external/:externalId')
  public getUserByExternalId(@Param('externalId') externalId: string) {
    return this.user.getByExternalId(externalId);
  }
}
