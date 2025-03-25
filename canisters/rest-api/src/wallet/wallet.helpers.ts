import { RpcServices } from 'azle/canisters/evm_rpc/idl';

export function parseServices(services: string): RpcServices {
  const parsed = JSON.parse(services, (key, value) =>
    key === 'chainId' ? BigInt(value) : value,
  );

  return parsed as RpcServices;
}
