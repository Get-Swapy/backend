import { HttpException, HttpStatus } from '@nestjs/common';

export class P2pOrderNotFoundException extends HttpException {
  constructor(orderId: string) {
    super(`Order with ID ${orderId} not found`, HttpStatus.NOT_FOUND);
  }
}

export class InvalidOrderStatusTransitionException extends HttpException {
  constructor(currentStatus: string, newStatus: string) {
    super(
      `Invalid status transition from ${currentStatus} to ${newStatus}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class InsufficientBalanceException extends HttpException {
  constructor(tokenId: string) {
    super(
      `Insufficient balance for token ${tokenId}`,
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}

export class InvalidAmountException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class UnsupportedTokenException extends HttpException {
  constructor(tokenId: string) {
    super(`Token ${tokenId} is not supported`, HttpStatus.BAD_REQUEST);
  }
}

export class UserNotFoundException extends HttpException {
  constructor(userId: string, role: 'buyer' | 'seller') {
    super(`${role} with ID ${userId} not found`, HttpStatus.NOT_FOUND);
  }
}
