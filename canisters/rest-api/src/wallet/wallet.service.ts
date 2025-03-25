import { Injectable } from '@nestjs/common';
import { canisterSelf } from 'azle';
import { Account } from 'azle/canisters/icrc_1/idl';

import { ICP } from './tokens/icp';
import { USDC } from './tokens/usdc';

@Injectable()
export class WalletService {
  constructor() {}

  private stringToUint8Array(str: string): Uint8Array {
    // Clean UUID by removing hyphens
    const cleanStr = str.replace(/-/g, '');

    const encoder = new TextEncoder();
    const initialArray = encoder.encode(cleanStr);

    // Ensure the input string is not longer than 32 bytes
    if (initialArray.length > 32) {
      throw new Error('Input string is too long - must be 32 bytes or less');
    }

    // Create a zero-filled array of exactly 32 bytes
    const paddedArray = new Uint8Array(32).fill(0);

    // Copy the encoded string bytes into the padded array
    paddedArray.set(initialArray.slice(0, 32));

    return paddedArray;
  }

  private getAccount(userId: string): Account {
    return {
      owner: canisterSelf(),
      subaccount: [this.stringToUint8Array(userId)],
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
        balance: Number(await USDC.balance(account)),
        decimals: await USDC.decimals(),
        address: await USDC.address(account),
      },
    ];

    return balances;
  }
}
