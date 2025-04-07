import { Module, forwardRef } from '@nestjs/common';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { P2pOrderModule } from '../p2p-order/p2p-order.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [forwardRef(() => WalletModule), forwardRef(() => P2pOrderModule)],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
