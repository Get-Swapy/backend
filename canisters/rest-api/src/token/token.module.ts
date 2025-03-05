import { Module } from '@nestjs/common';

import { TokenController } from './token.controller';
import { TokenService } from './token.service';
import { NetworkModule } from '../network/network.module';

@Module({
  imports: [NetworkModule],
  controllers: [TokenController],
  providers: [TokenService],
})
export class TokenModule {}
