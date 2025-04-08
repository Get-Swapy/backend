import { HttpException, HttpStatus } from '@nestjs/common';

export class P2POrderException extends HttpException {
  constructor(message: string, status: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(message, status);
  }
}

export class P2POrderNotFoundException extends P2POrderException {
  constructor(orderId: string) {
    const message = `P2P Order with ID ${orderId} was not found`;
    super(message, HttpStatus.NOT_FOUND);
  }
}

export class P2POrderValidationException extends P2POrderException {
  constructor(field: string, value: string, reason: string) {
    const message = `Validation failed for field '${field}' with value '${value}': ${reason}`;
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class P2POrderUnauthorizedException extends P2POrderException {
  constructor(userId: string, orderId: string, action: string) {
    const message = `User ${userId} is not authorized to ${action} order ${orderId}`;
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class UnsupportedTokenException extends P2POrderException {
  constructor(tokenId: string, supportedTokens: string[]) {
    const message = `Token ${tokenId} is not supported for P2P operations. Supported tokens: ${supportedTokens.join(', ')}`;
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class InsufficientBalanceException extends P2POrderException {
  constructor(
    tokenId: string,
    availableBalance: bigint,
    requiredAmount: bigint,
  ) {
    const message = `Insufficient balance for token ${tokenId}. Available: ${availableBalance}, Required: ${requiredAmount}`;
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class InvalidOrderStatusException extends P2POrderException {
  constructor(
    orderId: string,
    currentStatus: string,
    allowedStatuses: string[],
  ) {
    const message = `Invalid order status '${currentStatus}' for order ${orderId}. Allowed statuses: ${allowedStatuses.join(', ')}`;
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class InvalidOrderStatusTransitionException extends P2POrderException {
  constructor(
    currentStatus: string,
    attemptedStatus: string,
    allowedTransitions: string[],
  ) {
    const message = `Invalid status transition from '${currentStatus}' to '${attemptedStatus}'. Allowed transitions: ${allowedTransitions.join(', ')}`;
    super(message, HttpStatus.BAD_REQUEST);
  }
}
