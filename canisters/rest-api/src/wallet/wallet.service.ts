import { Injectable } from '@nestjs/common';
import { canisterSelf } from 'azle';
import { Account } from 'azle/canisters/icrc_1/idl';

import { TokenService } from './token.service';
import {
  RecipientNotFoundError,
  SenderNotFoundError,
  UnsupportedTokenError,
} from './wallet.errors';
import { uuidToUint8Array } from './wallet.helpers';
import { UserNotFoundError } from '../user/user.errors';
import { UserService } from '../user/user.service';

@Injectable()
export class WalletService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
  ) {}

  private getAccount(userId: string): Account {
    console.log(uuidToUint8Array(userId));
    return {
      owner: canisterSelf(),
      subaccount: [uuidToUint8Array(userId)],
    };
  }

  public async getBalances(userId: string) {
    // Validate if user exists
    const user = this.userService.getById(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }

    const account = this.getAccount(userId);
    const tokens = this.tokenService.getAllTokens();

    const balances = await Promise.all(
      tokens.map(async (tokenInfo) => {
        const balance = await tokenInfo.instance.balance(account);
        const decimals = await tokenInfo.instance.decimals();

        const balanceInfo: any = {
          token: tokenInfo.symbol,
          network: tokenInfo.network,
          balance: Number(balance),
          decimals: decimals,
          address: await tokenInfo.instance.address(account),
        };

        return balanceInfo;
      }),
    );

    return balances;
  }

  public transferToUser(data: {
    from: string;
    to: string;
    token: string;
    amount: number;
  }) {
    // Validate if users exist
    const { from, to, token, amount } = data;

    const fromUser = this.userService.getById(from);
    if (!fromUser) {
      throw new SenderNotFoundError(from);
    }

    const toUser = this.userService.getById(to);
    if (!toUser) {
      throw new RecipientNotFoundError(to);
    }

    // Validar que el token es soportado
    if (!this.tokenService.isTokenSupported(token)) {
      throw new UnsupportedTokenError(token);
    }

    const fromAccount = this.getAccount(from);
    const toAccount = this.getAccount(to);

    // Usar el servicio de tokens para realizar la transferencia
    return this.tokenService.transferToken(
      token,
      fromAccount,
      toAccount,
      amount,
    );
  }
}
