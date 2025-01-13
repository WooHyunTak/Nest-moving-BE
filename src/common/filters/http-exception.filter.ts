import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    console.log({
      path: request.path,
      method: request.method,
      error: exception,
      date: new Date(),
    });

    response.status(status).json({
      path: request.path,
      method: request.method,
      status,
      message: exception.message || 'Internal Server Error',
      // data: status >= 500 ? undefined : exception['response']?.data,
      date: new Date(),
    });
  }
}
