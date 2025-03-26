import { RpcServices } from 'azle/canisters/evm_rpc/idl';

// TODO: Fix this, BigInt conversion is not working
export function parseServices(services: string): RpcServices {
  const parsed = JSON.parse(services);

  if (parsed.Custom.chainId) {
    parsed.Custom.chainId = BigInt(parsed.Custom.chainId);
  }

  return parsed as RpcServices;
}

export function uuidToUint8Array(uuid: string): Uint8Array {
  // Clean UUID by removing hyphens
  const cleanStr = uuid.replace(/-/g, '');

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
