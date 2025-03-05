import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { RegisterTokenDto } from './dtos/register-token.dto';
import { TokenService } from './token.service';

@Controller('/tokens')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get('/')
  public getAll() {
    return this.tokenService.getAll();
  }

  @Post('/')
  public register(@Body() data: RegisterTokenDto) {
    return this.tokenService.register(data);
  }

  @Delete('/:symbol')
  public remove(@Param('symbol') symbol: string) {
    return this.tokenService.remove(symbol);
  }
}
