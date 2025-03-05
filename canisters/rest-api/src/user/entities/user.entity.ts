import { Record, text } from 'azle/experimental';

export const User = Record({
  id: text,
  platform: text, // telegram or whatsapp
  externalId: text,
});

export type User = typeof User.tsType;
