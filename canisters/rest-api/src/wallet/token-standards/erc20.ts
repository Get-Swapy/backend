import { RpcServices } from 'azle/canisters/evm_rpc/idl';
import { Account } from 'azle/canisters/icrc_1/idl';
import { AbiCoder, keccak256, toUtf8Bytes } from 'ethers';

import { CallPayload, EvmRpcService } from '../../evm-rpc/evm-rpc.service';

export const ERC20 = (address: string, service: RpcServices) => {
  const evmRpc = new EvmRpcService(service);

  return {
    async address(account: Account): Promise<string> {
      return evmRpc.accountToAddress(account);
    },
    async balance(account: Account): Promise<bigint> {
      const functionSignature = 'balanceOf(address)';
      const selector = keccak256(toUtf8Bytes(functionSignature)).slice(0, 10);
      const abiCoder = new AbiCoder();
      const accountAddress = await evmRpc.accountToAddress(account);
      const args = abiCoder.encode(['address'], [accountAddress]);
      const input = selector + args.slice(2);

      const payload: CallPayload = {
        to: address,
        input,
      };

      const result = await evmRpc.call(payload);
      const balance = BigInt(result);

      return balance;
    },

    async decimals(): Promise<number> {
      const functionSignature = 'decimals()';
      const selector = keccak256(toUtf8Bytes(functionSignature)).slice(0, 10);

      const payload: CallPayload = {
        to: address,
        input: selector,
      };

      const result = await evmRpc.call(payload);
      const decimals = Number(BigInt(result));

      return decimals;
    },
  };
};
