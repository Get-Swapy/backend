import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { CreateUserDto } from './dtos/create-user.dto';
import { UserService } from './user.service';

@Controller('/users')
export class UserController {
  constructor(private readonly user: UserService) {}

  @Get('/')
  public getAll() {
    return this.user.getAll();
  }

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

  @Delete('/:userId')
  public removeUser(@Param('userId') userId: string) {
    return this.user.removeById(userId);
  }
}
