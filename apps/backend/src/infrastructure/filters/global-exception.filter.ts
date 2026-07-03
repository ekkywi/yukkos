import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { RelationalConstraintError, DatabaseOperationError, ListingNotFoundError } from '../../domain/exceptions/database.exception';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage: string | object = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      errorMessage = exception.getResponse();
    }

    else if (exception instanceof RelationalConstraintError) {
      status = HttpStatus.BAD_REQUEST;
      errorMessage = exception.message;
    }

    else if (exception instanceof DatabaseOperationError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorMessage = exception.message;
    }

    else if (exception instanceof ListingNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      errorMessage = exception.message;
    }

    else if (exception instanceof Error) {
      errorMessage = exception.message;
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      error: typeof errorMessage === 'string' ? errorMessage : (errorMessage as any).message || errorMessage,
      timestamp: new Date().toISOString(),
    });
  }
}