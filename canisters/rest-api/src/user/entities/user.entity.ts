import { Record, text } from 'azle/experimental';

export const User = Record({
  id: text,
  externalId: text,
});

export type User = typeof User.tsType;
