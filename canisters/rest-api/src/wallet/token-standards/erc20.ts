import { RpcServices } from 'azle/canisters/evm_rpc/idl';
import { Account } from 'azle/canisters/icrc_1/idl';
import { AbiCoder, getUint, keccak256, toUtf8Bytes } from 'ethers';

import {
  CallPayload,
  EvmRpcService,
  TransactionPayload,
} from '../../evm-rpc/evm-rpc.service';

export const ERC20 = (
  contractAddress: string,
  service: RpcServices,
  explorerUrl: string,
) => {
  const evmRpc = new EvmRpcService(service);

  return {
    async address(account: Account): Promise<string> {
      return evmRpc.accountToAddress(account);
    },
    async decimals(): Promise<number> {
      const functionSignature = 'decimals()';
      const selector = keccak256(toUtf8Bytes(functionSignature)).slice(0, 10);

      const payload: CallPayload = {
        to: contractAddress,
        input: selector,
      };

      const result = await evmRpc.call(payload);
      const decimals = Number(BigInt(result));

      return decimals;
    },
    async balance(account: Account): Promise<bigint> {
      const functionSignature = 'balanceOf(address)';
      const selector = keccak256(toUtf8Bytes(functionSignature)).slice(0, 10);
      const abiCoder = new AbiCoder();
      const accountAddress = await evmRpc.accountToAddress(account);
      const args = abiCoder.encode(['address'], [accountAddress]);
      const input = selector + args.slice(2);

      const payload: CallPayload = {
        to: contractAddress,
        input,
      };

      const result = await evmRpc.call(payload);
      const balance = BigInt(result);

      return balance;
    },
    async transfer(from: Account, to: Account, amount: number) {
      const functionSignature = 'transfer(address,uint256)';
      const selector = keccak256(toUtf8Bytes(functionSignature)).slice(0, 10);
      const abiCoder = new AbiCoder();
      const toAddress = await this.address(to);
      const args = abiCoder.encode(
        ['address', 'uint256'],
        [toAddress, getUint(amount)],
      );
      const data = selector + args.slice(2);

      const payload: TransactionPayload = {
        to: contractAddress,
        data,
        value: getUint(0),
      };

      const result = await evmRpc.sendTransaction(payload, from);

      // TODO: validate if result[0] has a value
      // TODO: validate if transaction was successful
      return {
        transactionId: result[0],
        explorerUrl: `${explorerUrl}/tx/${result[0]}`,
      };
    },
  };
};
