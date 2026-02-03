import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isDev = process.env.ENV !== 'production';

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // 🔒 Production: generic message
    if (!isDev) {
      response.status(status).json({
        status,
        message: exception instanceof HttpException
        ? exception.message
          : 'An error occurred. Please try again.',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    }

    // 🛠 Development: detailed error
    response.status(status).json({
      status,
      message:
        exception instanceof HttpException
          ? exception.message
          : 'Internal server error',
      error:
        exception instanceof HttpException
          ? exception.getResponse()
          : 'Unexpected error',
      timestamp: new Date().toISOString(),
      path: request.url,
      stack: exception instanceof Error ? exception.stack : undefined,
    });
  }
}
