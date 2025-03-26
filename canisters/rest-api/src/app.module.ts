import { Module } from '@nestjs/common';

import { CoreModule } from './core/core.module';
import { UserModule } from './user/user.module';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [CoreModule, UserModule, WalletModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
