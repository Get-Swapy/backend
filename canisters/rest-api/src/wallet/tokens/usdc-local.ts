import { ERC20 } from '../token-stadards/erc20';

export const LUSDC = ERC20('0x5FbDB2315678afecb367f032d93F642f64180aa3', {
  // TODO: Get this from Environment
  Custom: {
    chainId: BigInt(31337),
    services: [
      {
        url: 'https://localhost:8546',
        headers: [],
      },
    ],
  },
});
