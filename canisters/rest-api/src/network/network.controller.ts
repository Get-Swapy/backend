import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { RegisterNetworkDto } from './dtos/register-network.dto';
import { NetworkService } from './network.service';

@Controller('networks')
export class NetworkController {
  constructor(private readonly networkService: NetworkService) {}

  @Get('/')
  public getAll() {
    return this.networkService.getAll();
  }

  @Post('/')
  public register(@Body() data: RegisterNetworkDto) {
    return this.networkService.register(data);
  }

  @Delete('/:networkId')
  public remove(@Param('networkId') networkId: string) {
    return this.networkService.remove(networkId);
  }
}
