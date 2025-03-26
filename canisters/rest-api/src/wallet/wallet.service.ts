import { Injectable } from '@nestjs/common';
import { canisterSelf } from 'azle';
import { Account } from 'azle/canisters/icrc_1/idl';

import { ICP } from './tokens/icp';
import { USDC_ARBITRUM } from './tokens/usdc_arbitrum';
import { uuidToUint8Array } from './wallet.helpers';

@Injectable()
export class WalletService {
  constructor() {}

  private getAccount(userId: string): Account {
    return {
      owner: canisterSelf(),
      subaccount: [uuidToUint8Array(userId)],
    };
  }

  public async getBalances(userId: string) {
    const account = this.getAccount(userId);

    const balances = [
      {
        token: 'ICP',
        network: 'Internet Computer',
        balance: Number(await ICP.balance(account)),
        decimals: await ICP.decimals(),
        // address: await ICP.address(account),
      },
      {
        token: 'USDC',
        network: 'Arbitrum One',
        balance: Number(await USDC_ARBITRUM.balance(account)),
        decimals: await USDC_ARBITRUM.decimals(),
        address: await USDC_ARBITRUM.address(account),
      },
    ];

    return balances;
  }
}
