import { Module, forwardRef } from '@nestjs/common';

import { P2pOrderController } from './p2p-order.controller';
import { P2pOrderService } from './p2p-order.service';
import { UserModule } from '../user/user.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [forwardRef(() => UserModule), forwardRef(() => WalletModule)],
  controllers: [P2pOrderController],
  providers: [P2pOrderService],
  exports: [P2pOrderService],
})
export class P2pOrderModule {}
