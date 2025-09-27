/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'An unexpected internal server error occurred';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error:
        typeof message === 'string'
          ? message
          : (message as any).error || 'Internal Server Error',
      details:
        typeof message === 'object' && (message as any).message
          ? (message as any).message
          : undefined,
    };

    this.logger.error(
      `HTTP Status: ${status} Error Message: ${JSON.stringify(errorResponse)}`,
      exception instanceof Error ? exception.stack : '',
    );
    response.status(status).json(errorResponse);
  }
}
