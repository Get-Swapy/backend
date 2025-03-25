import { IDL, call } from 'azle';
import { Account } from 'azle/canisters/icrc_1/idl';

export const ICRC = (canisterId: string) => ({
  async icrc1_decimals(): Promise<number> {
    const decimals = await call<[], number>(canisterId, 'icrc1_decimals', {
      paramIdlTypes: [],
      returnIdlType: IDL.Nat8,
      args: [],
    });

    return decimals;
  },
  async icrc1_balance_of(account: Account): Promise<bigint> {
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
});
