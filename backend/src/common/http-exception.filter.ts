/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

export const APIResponseMessage = {
  serverError: 'Critical server error occured, please try again later',
};

export interface IRequestException {
  statusCode: number;
  message: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, message } = this.getException(exception);
    response.status(statusCode).json({
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }

  private getException(exception: any): IRequestException {
    let statusCode: number;
    let message: any;
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const errorResponse: string | object = exception.getResponse();
      message = (errorResponse as string) || exception.message;
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = APIResponseMessage.serverError;
    }
    return { statusCode, message };
  }
}
