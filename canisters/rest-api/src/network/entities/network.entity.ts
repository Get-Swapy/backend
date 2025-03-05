import { Record, text } from 'azle/experimental';

export const Network = Record({
  name: text,
});

export type Network = typeof Network.tsType;
