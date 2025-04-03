import { Module, forwardRef } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { TokenService } from './token.service';
import { WalletController } from './wallet.controller';
import { WalletExceptionFilter } from './wallet.exception.filter';
import { WalletService } from './wallet.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [forwardRef(() => UserModule)],
  controllers: [WalletController],
  providers: [
    WalletService,
    TokenService,
    {
      provide: APP_FILTER,
      useClass: WalletExceptionFilter,
    },
  ],
  exports: [WalletService, TokenService],
})
export class WalletModule {}
