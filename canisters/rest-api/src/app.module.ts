import { Module } from '@nestjs/common';

import { CoreModule } from './core/core.module';
import { NetworkModule } from './network/network.module';
import { TokenModule } from './token/token.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [CoreModule, UserModule, TokenModule, NetworkModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
