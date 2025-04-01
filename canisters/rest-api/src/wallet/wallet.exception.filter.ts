import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

import {
  RecipientNotFoundError,
  SenderNotFoundError,
  UnsupportedTokenError,
} from './wallet.errors';
import { UserNotFoundError } from '../user/user.errors';

@Catch(
  UserNotFoundError,
  SenderNotFoundError,
  RecipientNotFoundError,
  UnsupportedTokenError,
)
export class WalletExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    // Map domain errors to appropriate HTTP status codes
    if (
      exception instanceof UserNotFoundError ||
      exception instanceof SenderNotFoundError ||
      exception instanceof RecipientNotFoundError
    ) {
      status = HttpStatus.NOT_FOUND;
    } else if (exception instanceof UnsupportedTokenError) {
      status = HttpStatus.BAD_REQUEST;
    }

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      error: exception.name,
    });
  }
}
