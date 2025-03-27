import { ICRC } from '../token-standards/icrc';

// TODO: Get from env
const ICP_LEDGER_CANISTER_ID = 'ryjl3-tyaaa-aaaaa-aaaba-cai';
const ICP_EXPLORER_URL = 'https://dashboard.internetcomputer.org/transaction';

export const ICP = ICRC(ICP_LEDGER_CANISTER_ID, ICP_EXPLORER_URL);
