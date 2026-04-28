import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ActionLogService } from '../services/action-log.service';
import { LogType, LogLevel } from '../database/models/ActionLogMongo';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly actionLogService: ActionLogService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
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
        : 'Internal server error';

    const errorMessage =
      exception instanceof Error ? exception.message : String(exception);
    const errorStack = exception instanceof Error ? exception.stack : undefined;

    const logData = {
      type: LogType.ERROR,
      level: status >= 500 ? LogLevel.ERROR : LogLevel.WARN,
      message: `HTTP ${status}: ${errorMessage}`,
      metadata: {
        method: request.method,
        url: request.url,
        statusCode: status,
        response: message,
        errorName: exception instanceof Error ? exception.name : 'Error',
        errorStack,
        body: request.body,
        params: request.params,
        query: request.query,
      },
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      userId: (request as any).user?.userId,
    };

    try {
      await this.actionLogService.createLog(logData);
    } catch (logError) {
      this.logger.error(`Failed to log error: ${logError}`);
    }

    this.logger.error(
      `${request.method} ${request.url} ${status} - ${errorMessage}`,
      errorStack,
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
