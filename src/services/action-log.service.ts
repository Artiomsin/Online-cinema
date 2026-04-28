import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ActionLog,
  LogType,
  LogLevel,
  UserActionType,
} from '../database/models/ActionLogMongo';

export interface CreateLogDto {
  type: LogType;
  level?: LogLevel;
  action?: UserActionType;
  userId?: number;
  message: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface LogFilterDto {
  userId?: number;
  type?: LogType;
  level?: LogLevel;
  action?: UserActionType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

@Injectable()
export class ActionLogService {
  private readonly logger = new Logger(ActionLogService.name);

  constructor(
    @InjectModel(ActionLog.name) private actionLogModel: Model<ActionLog>,
  ) {}

  async createLog(dto: CreateLogDto): Promise<ActionLog> {
    try {
      const log = new this.actionLogModel({
        ...dto,
        level: dto.level || LogLevel.INFO,
        timestamp: new Date(),
      });
      const saved = await log.save();
      this.logger.debug(`Log created: ${dto.type} - ${dto.message}`);
      return saved;
    } catch (error: any) {
      this.logger.error(`Failed to create log: ${error.message}`);
      throw error;
    }
  }

  async logUserAction(
    userId: number | undefined,
    action: UserActionType,
    message: string,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ActionLog> {
    return this.createLog({
      type: LogType.USER_ACTION,
      level: LogLevel.INFO,
      action,
      userId,
      message,
      metadata,
      ipAddress,
      userAgent,
    });
  }

  async logError(
    message: string,
    error: Error | any,
    userId?: number,
  ): Promise<ActionLog> {
    return this.createLog({
      type: LogType.ERROR,
      level: LogLevel.ERROR,
      userId,
      message,
      metadata: {
        errorMessage: error?.message,
        errorStack: error?.stack,
        errorName: error?.name,
      },
    });
  }

  async findLogs(filter: LogFilterDto): Promise<ActionLog[]> {
    const query: any = {};

    if (filter.userId) query.userId = filter.userId;
    if (filter.type) query.type = filter.type;
    if (filter.level) query.level = filter.level;
    if (filter.action) query.action = filter.action;

    if (filter.startDate || filter.endDate) {
      query.timestamp = {};
      if (filter.startDate) query.timestamp.$gte = filter.startDate;
      if (filter.endDate) query.timestamp.$lte = filter.endDate;
    }

    return this.actionLogModel
      .find(query)
      .sort({ timestamp: -1 })
      .skip(filter.offset || 0)
      .limit(filter.limit || 50)
      .exec();
  }

  async countLogs(filter: LogFilterDto): Promise<number> {
    const query: any = {};

    if (filter.userId) query.userId = filter.userId;
    if (filter.type) query.type = filter.type;
    if (filter.level) query.level = filter.level;
    if (filter.action) query.action = filter.action;

    if (filter.startDate || filter.endDate) {
      query.timestamp = {};
      if (filter.startDate) query.timestamp.$gte = filter.startDate;
      if (filter.endDate) query.timestamp.$lte = filter.endDate;
    }

    return this.actionLogModel.countDocuments(query).exec();
  }

  async getLogsByUser(
    userId: number,
    limit: number = 50,
  ): Promise<ActionLog[]> {
    return this.actionLogModel
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  async getRecentLogs(limit: number = 50): Promise<ActionLog[]> {
    return this.actionLogModel
      .find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  async getErrorLogs(limit: number = 50): Promise<ActionLog[]> {
    return this.actionLogModel
      .find({ level: LogLevel.ERROR })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }
}
