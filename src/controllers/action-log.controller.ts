import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Res,
  Param,
} from '@nestjs/common';
import { ActionLogService, LogFilterDto } from '../services/action-log.service';
import { AggregationReportsService } from '../services/aggregation-reports.service';
import {
  LogType,
  LogLevel,
  UserActionType,
} from '../database/models/ActionLogMongo';
import type { Response } from 'express';

class GetLogsDto {
  userId?: number;
  type?: LogType;
  level?: LogLevel;
  action?: UserActionType;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

class ReportQueryDto {
  startDate?: string;
  endDate?: string;
  period?: 'day' | 'week' | 'month';
  groupBy?: 'hour' | 'day' | 'week' | 'month';
  limit?: number;
  threshold?: number;
}

@Controller('logs')
export class ActionLogController {
  constructor(
    private readonly actionLogService: ActionLogService,
    private readonly aggregationService: AggregationReportsService,
  ) {}

  @Get()
  async getLogs(@Query() query: GetLogsDto) {
    const filter: LogFilterDto = {
      userId: query.userId ? Number(query.userId) : undefined,
      type: query.type as LogType,
      level: query.level as LogLevel,
      action: query.action as UserActionType,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      limit: query.limit ? Number(query.limit) : 50,
      offset: query.offset ? Number(query.offset) : 0,
    };

    const logs = await this.actionLogService.findLogs(filter);
    const total = await this.actionLogService.countLogs(filter);

    return {
      logs,
      total,
      filter,
    };
  }

  @Get('recent')
  async getRecentLogs(@Query('limit') limit?: string) {
    const logs = await this.actionLogService.getRecentLogs(
      limit ? Number(limit) : 50,
    );
    return { logs };
  }

  @Get('errors')
  async getErrorLogs(@Query('limit') limit?: string) {
    const logs = await this.actionLogService.getErrorLogs(
      limit ? Number(limit) : 50,
    );
    return { logs };
  }

  @Get('user/:userId')
  async getUserLogs(
    @Query('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    const logs = await this.actionLogService.getLogsByUser(
      Number(userId),
      limit ? Number(limit) : 50,
    );
    return { logs };
  }

  @Get('reports/activity')
  async getActivityReport(@Query() query: ReportQueryDto) {
    const startDate = query.startDate
      ? new Date(query.startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    const data = await this.aggregationService.getUserActivityByPeriod(
      startDate,
      endDate,
      query.period || 'day',
    );
    return { data, startDate, endDate, period: query.period || 'day' };
  }

  @Get('reports/top-users')
  async getTopUsersReport(@Query() query: ReportQueryDto) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    const data = await this.aggregationService.getTopActiveUsers(
      Number(query.limit) || 10,
      startDate,
      endDate,
    );
    return { data, limit: Number(query.limit) || 10 };
  }

  @Get('reports/crud')
  async getCrudReport(@Query() query: ReportQueryDto) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    const data = await this.aggregationService.getCrudStatistics(
      startDate,
      endDate,
    );
    return { data };
  }

  @Get('reports/trends')
  async getTrendsReport(@Query() query: ReportQueryDto) {
    const startDate = query.startDate
      ? new Date(query.startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    const data = await this.aggregationService.getTimeSeriesTrends(
      startDate,
      endDate,
      query.groupBy || 'day',
    );
    return { data, startDate, endDate, groupBy: query.groupBy || 'day' };
  }

  @Get('reports/anomalies')
  async getAnomaliesReport(@Query() query: ReportQueryDto) {
    const data = await this.aggregationService.detectAnomalies(
      Number(query.threshold) || 3,
    );
    return { data, threshold: Number(query.threshold) || 3 };
  }

  @Get('reports/export/json')
  async exportJsonReport(
    @Query('type') type: string,
    @Query() query: ReportQueryDto,
  ) {
    return this.aggregationService.exportToJSON(type, query);
  }

  @Get('reports/export/csv')
  async exportCsvReport(
    @Query('type') type: string,
    @Query() query: ReportQueryDto,
    @Res() res: Response,
  ) {
    const csv = await this.aggregationService.exportToCSV(type, query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=report-${type}-${Date.now()}.csv`,
    );
    res.send(csv);
  }
}
