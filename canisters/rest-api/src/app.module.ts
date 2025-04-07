import { Module } from '@nestjs/common';

import { CoreModule } from './core/core.module';
import { P2pOrderModule } from './p2p-order/p2p-order.module';
import { UserModule } from './user/user.module';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [CoreModule, UserModule, WalletModule, P2pOrderModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
