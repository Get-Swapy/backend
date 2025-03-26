import { RpcServices } from 'azle/canisters/evm_rpc/idl';

import { ERC20 } from '../token-standards/erc20';
// import { parseServices } from '../wallet.helpers';

// TODO: Get from env
const USDC_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
// const USDC_SERVICES: RpcServices = {
//   ArbitrumOne: [[{ Alchemy: null }]],
// };

// const USDC_SERVICES: RpcServices = parseServices(
//   '{"Custom":{"chainId":31337,"services":[{"url":"http://localhost:8546","headers":[]}]}}',
// );

const USDC_SERVICES: RpcServices = {
  Custom: {
    chainId: 31337n,
    services: [
      {
        url: 'https://localhost:8546',
        headers: [],
      },
    ],
  },
};

export const USDC_ARBITRUM = ERC20(USDC_ADDRESS, USDC_SERVICES);
