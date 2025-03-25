import { RpcServices } from 'azle/canisters/evm_rpc/idl';

// TODO: Fix this, BigInt conversion is not working
export function parseServices(services: string): RpcServices {
  const parsed = JSON.parse(services);

  if (parsed.Custom.chainId) {
    parsed.Custom.chainId = BigInt(parsed.Custom.chainId);
  }

  return parsed as RpcServices;
}
