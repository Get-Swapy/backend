import { Record, Vec, text } from 'azle/experimental';

export const Token = Record({
  name: text,
  symbol: text,
  networks: Vec(text),
});

export type Token = typeof Token.tsType;
