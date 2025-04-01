/**
 * Custom domain errors for the wallet module
 */

export class SenderNotFoundError extends Error {
  constructor(userId: string) {
    super(`Sender with ID ${userId} not found`);
    this.name = 'SenderNotFoundError';
  }
}

export class RecipientNotFoundError extends Error {
  constructor(userId: string) {
    super(`Recipient with ID ${userId} not found`);
    this.name = 'RecipientNotFoundError';
  }
}

export class UnsupportedTokenError extends Error {
  constructor(tokenId: string) {
    super(`Token ${tokenId} is not supported`);
    this.name = 'UnsupportedTokenError';
  }
}
