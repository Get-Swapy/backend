import { Module } from '@nestjs/common';

import { CoreModule } from './core/core.module';
import { NetworkModule } from './network/network.module';
import { TokenModule } from './token/token.module';
import { UserModule } from './user/user.module';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [CoreModule, UserModule, WalletModule, TokenModule, NetworkModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
