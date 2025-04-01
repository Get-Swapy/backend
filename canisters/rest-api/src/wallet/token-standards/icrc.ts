import { IDL, call } from 'azle';
import {
  Account,
  TransferArgs,
  TransferResult,
} from 'azle/canisters/icrc_1/idl';

export const ICRC = (canisterId: string, explorerUrl: string) => ({
  async address(account: Account): Promise<string> {
    return '';
  },
  async decimals(): Promise<number> {
    const decimals = await call<[], number>(canisterId, 'icrc1_decimals', {
      paramIdlTypes: [],
      returnIdlType: IDL.Nat8,
      args: [],
    });

    return decimals;
  },
  async balance(account: Account): Promise<bigint> {
    const balance = await call<[Account], bigint>(
      canisterId,
      'icrc1_balance_of',
      {
        paramIdlTypes: [Account],
        returnIdlType: IDL.Nat,
        args: [account],
      },
    );

    return balance;
  },
  // TODO: Type return
  async transfer(from: Account, to: Account, amount: number) {
    const result = await call<[TransferArgs], TransferResult>(
      canisterId,
      'icrc1_transfer',
      {
        paramIdlTypes: [TransferArgs],
        returnIdlType: TransferResult,
        args: [
          {
            to,
            from_subaccount: from.subaccount,
            amount: BigInt(amount),
            fee: [],
            memo: [],
            created_at_time: [],
          },
        ],
      },
    );

    if ('Ok' in result) {
      return {
        transactionId: result.Ok.toString(),
        explorerUrl: `${explorerUrl}/${result.Ok.toString()}`,
      };
    }

    // TODO: Improve error handling

    throw new Error('Transfer failed');
  },
});
