import { HttpException, HttpStatus } from '@nestjs/common';

export class UserException extends HttpException {
  constructor(message: string, status: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(message, status);
  }
}

export class UserNotFoundException extends UserException {
  constructor(message: string = 'User not found') {
    super(message, HttpStatus.NOT_FOUND);
  }
}
