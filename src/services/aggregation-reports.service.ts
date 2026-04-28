import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ActionLog,
  LogType,
  UserActionType,
} from '../database/models/ActionLogMongo';

/*Аномалии (5 типов):
- HIGH_ACTIVITY: >30 действий в час
- HIGH_ERROR_RATE: >50% ошибок от общего числа
- REPEAT_ACTIONS: >6 одинаковых действий за час
- RAPID_CONTENT_ACCESS: >20 действий с разным контентом за час (возможный скрипт/бот)
- RAPID_VIEWING: >10 просмотров разных фильмов за час (возможный бот/множество вкладок)*/

export interface UserActivityStats {
  userId: number;
  totalActions: number;
  loginCount: number;
  logoutCount: number;
  createCount: number;
  updateCount: number;
  deleteCount: number;
}

export interface OperationStats {
  action: string;
  count: number;
  percentage: number;
}

export interface TimeSeriesData {
  date: string;
  count: number;
}

export interface AnomalyData {
  userId: number;
  totalActions: number;
  actionsLastHour: number;
  actionVariety: number;
  lastActivity: Date;
  severity: 'low' | 'medium' | 'high';
}

@Injectable()
export class AggregationReportsService {
  constructor(
    @InjectModel(ActionLog.name) private actionLogModel: Model<ActionLog>,
  ) {}

  async getUserActivityByPeriod(
    startDate: Date,
    endDate: Date,
    period: 'day' | 'week' | 'month' = 'day',
  ): Promise<any[]> {
    const dateFormat =
      period === 'day' ? '%Y-%m-%d' : period === 'week' ? '%Y-W%V' : '%Y-%m';

    const pipeline = [
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
          userId: { $ne: null },
        },
      },
      {
        $group: {
          _id: {
            userId: '$userId',
            period: {
              $dateToString: { format: dateFormat, date: '$timestamp' },
            },
          },
          totalActions: { $sum: 1 },
          loginCount: {
            $sum: { $cond: [{ $eq: ['$action', 'login'] }, 1, 0] },
          },
          logoutCount: {
            $sum: { $cond: [{ $eq: ['$action', 'logout'] }, 1, 0] },
          },
          createCount: {
            $sum: { $cond: [{ $eq: ['$action', 'create'] }, 1, 0] },
          },
          updateCount: {
            $sum: { $cond: [{ $eq: ['$action', 'update'] }, 1, 0] },
          },
          deleteCount: {
            $sum: { $cond: [{ $eq: ['$action', 'delete'] }, 1, 0] },
          },
        },
      },
      { $sort: { '_id.period': 1, totalActions: -1 } },
    ];

    return this.actionLogModel.aggregate(pipeline as any);
  }

  async getTopActiveUsers(
    limit: number = 10,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any[]> {
    const match: any = { userId: { $ne: null } };
    if (startDate && endDate) {
      match.timestamp = { $gte: startDate, $lte: endDate };
    }

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: '$userId',
          totalActions: { $sum: 1 },
          loginCount: {
            $sum: { $cond: [{ $eq: ['$action', 'login'] }, 1, 0] },
          },
          createCount: {
            $sum: { $cond: [{ $eq: ['$action', 'create'] }, 1, 0] },
          },
          updateCount: {
            $sum: { $cond: [{ $eq: ['$action', 'update'] }, 1, 0] },
          },
          deleteCount: {
            $sum: { $cond: [{ $eq: ['$action', 'delete'] }, 1, 0] },
          },
          lastActivity: { $max: '$timestamp' },
          firstActivity: { $min: '$timestamp' },
        },
      },
      { $sort: { totalActions: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          totalActions: 1,
          loginCount: 1,
          createCount: 1,
          updateCount: 1,
          deleteCount: 1,
          lastActivity: 1,
          firstActivity: 1,
        },
      },
    ];

    return this.actionLogModel.aggregate(pipeline as any);
  }

  async getCrudStatistics(
    startDate?: Date,
    endDate?: Date,
  ): Promise<OperationStats[]> {
    const match: any = {
      action: {
        $in: ['login', 'logout', 'register', 'create', 'update', 'delete'],
      },
    };
    if (startDate && endDate) {
      match.timestamp = { $gte: startDate, $lte: endDate };
    }

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ];

    const results = await this.actionLogModel.aggregate(pipeline as any);
    const total = results.reduce((sum, r) => sum + r.count, 0);

    return results.map((r) => ({
      action: r._id || 'UNKNOWN',
      count: r.count,
      percentage: total > 0 ? Number(((r.count / total) * 100).toFixed(2)) : 0,
    }));
  }

  async getTimeSeriesTrends(
    startDate: Date,
    endDate: Date,
    groupBy: 'hour' | 'day' | 'week' | 'month' = 'day',
  ): Promise<TimeSeriesData[]> {
    let format: string;
    switch (groupBy) {
      case 'hour':
        format = '%Y-%m-%d %H:00';
        break;
      case 'week':
        format = '%Y-W%V';
        break;
      case 'month':
        format = '%Y-%m';
        break;
      default:
        format = '%Y-%m-%d';
    }

    const pipeline = [
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format, date: '$timestamp' } },
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
          errors: { $sum: { $cond: [{ $eq: ['$type', 'error'] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          count: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          errors: 1,
        },
      },
    ];

    return this.actionLogModel.aggregate(pipeline as any);
  }

  async detectAnomalies(threshold: number = 3): Promise<any[]> {
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const minute5Ago = new Date(now.getTime() - 5 * 60 * 1000);
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const repeatThreshold = 6;

    const pipeline = [
      {
        $match: {
          userId: { $ne: null },
          timestamp: { $gte: dayAgo },
        },
      },
      {
        $group: {
          _id: '$userId',
          totalActions: { $sum: 1 },
          actionsLastHour: {
            $sum: {
              $cond: [{ $gte: ['$timestamp', hourAgo] }, 1, 0],
            },
          },
          uniqueActions: { $addToSet: '$action' },
          actionCounts: {
            $push: {
              action: '$action',
              timestamp: '$timestamp',
              type: '$type',
            },
          },
          errorsCount: {
            $sum: { $cond: [{ $eq: ['$type', 'error'] }, 1, 0] },
          },
          lastActivity: { $max: '$timestamp' },
          firstActivity: { $min: '$timestamp' },
          loginCountHour: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$action', 'login'] },
                    { $gte: ['$timestamp', hourAgo] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          logoutCountHour: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$action', 'logout'] },
                    { $gte: ['$timestamp', hourAgo] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          createCountHour: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$action', 'create'] },
                    { $gte: ['$timestamp', hourAgo] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          viewCountHour: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$action', 'view'] },
                    { $gte: ['$timestamp', hourAgo] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          uniqueViewsLastHour: {
            $addToSet: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$action', 'view'] },
                    { $gte: ['$timestamp', hourAgo] },
                  ],
                },
                '$metadata.movieId',
                '$$REMOVE',
              ],
            },
          },
          viewCount5min: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$action', 'view'] },
                    { $gte: ['$timestamp', minute5Ago] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          uniqueViewsLast5min: {
            $addToSet: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$action', 'view'] },
                    { $gte: ['$timestamp', minute5Ago] },
                  ],
                },
                '$metadata.movieId',
                '$$REMOVE',
              ],
            },
          },
          uniqueActionsLastHour: {
            $addToSet: {
              $cond: [{ $gte: ['$timestamp', hourAgo] }, '$action', '$$REMOVE'],
            },
          },
        },
      },
      {
        $addFields: {
          actionVariety: { $size: '$uniqueActions' },
          actionsLastHourVariety: { $size: '$uniqueActionsLastHour' },
          uniqueViewsCount: { $size: '$uniqueViewsLastHour' },
          uniqueViewsCount5min: { $size: '$uniqueViewsLast5min' },
          errorRate: {
            $cond: [
              { $gt: ['$totalActions', 0] },
              { $divide: ['$errorsCount', '$totalActions'] },
              0,
            ],
          },
        },
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          totalActions: 1,
          actionsLastHour: 1,
          actionVariety: 1,
          errorsCount: 1,
          errorRate: 1,
          lastActivity: 1,
          firstActivity: 1,
          loginCountHour: 1,
          logoutCountHour: 1,
          createCountHour: 1,
          anomalyTypes: {
            $filter: {
              input: [
                {
                  cond: { $gte: ['$actionsLastHour', threshold * 10] },
                  type: 'HIGH_ACTIVITY',
                  desc: 'Более 30 действий за час',
                },
                {
                  cond: { $gte: ['$errorRate', 0.5] },
                  type: 'HIGH_ERROR_RATE',
                  desc: 'Более 50% ошибок',
                },
                {
                  cond: { $gte: ['$loginCountHour', repeatThreshold] },
                  type: 'REPEAT_ACTIONS',
                  desc: `${repeatThreshold}+ одинаковых действий (login) за час`,
                },
                {
                  cond: { $gte: ['$logoutCountHour', repeatThreshold] },
                  type: 'REPEAT_ACTIONS',
                  desc: `${repeatThreshold}+ одинаковых действий (logout) за час`,
                },
                {
                  cond: { $gte: ['$createCountHour', repeatThreshold] },
                  type: 'REPEAT_ACTIONS',
                  desc: `${repeatThreshold}+ одинаковых действий (create) за час`,
                },
                {
                  cond: { $gte: ['$actionsLastHourVariety', 20] },
                  type: 'RAPID_CONTENT_ACCESS',
                  desc: 'Более 20 разных действий за час (возможный скрипт/бот)',
                },
                {
                  cond: { $gte: ['$uniqueViewsCount', 10] },
                  type: 'RAPID_VIEWING',
                  desc: 'Более 10 просмотров разных фильмов за час (возможный бот)',
                },
                {
                  cond: { $gte: ['$uniqueViewsCount5min', 5] },
                  type: 'RAPID_VIEWING_5MIN',
                  desc: 'Более 5 просмотров разных фильмов за 5 минут (возможный бот)',
                },
              ],
              as: 'item',
              cond: '$$item.cond',
            },
          },
        },
      },
      {
        $match: {
          anomalyTypes: { $ne: [] },
        },
      },
      {
        $project: {
          userId: 1,
          totalActions: 1,
          actionsLastHour: 1,
          actionsLastHourVariety: 1,
          uniqueViewsCount: 1,
          uniqueViewsCount5min: 1,
          actionVariety: 1,
          errorsCount: 1,
          errorRate: { $round: [{ $multiply: ['$errorRate', 100] }, 1] },
          lastActivity: 1,
          anomalyTypes: 1,
          severity: {
            $switch: {
              branches: [
                {
                  case: { $gte: ['$errorRate', 0.5] },
                  then: 'high',
                },
                {
                  case: { $gte: ['$actionsLastHour', 30] },
                  then: 'high',
                },
                {
                  case: { $gte: ['$uniqueViewsCount5min', 10] },
                  then: 'high',
                },
                {
                  case: { $gte: ['$actionsLastHour', 20] },
                  then: 'medium',
                },
                {
                  case: { $gte: ['$uniqueViewsCount5min', 5] },
                  then: 'medium',
                },
              ],
              default: 'low',
            },
          },
        },
      },
      { $sort: { severity: -1, totalActions: -1 } },
    ];

    const results = await this.actionLogModel.aggregate(pipeline as any);

    return results.map((r) => ({
      ...r,
      anomalyTypes: r.anomalyTypes.map((a: any) => ({
        type: a.type,
        description: a.desc,
      })),
    }));
  }

  async getLogsByUserReport(
    userId: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any[]> {
    const match: any = { userId };
    if (startDate && endDate) {
      match.timestamp = { $gte: startDate, $lte: endDate };
    }

    return this.actionLogModel
      .find(match)
      .sort({ timestamp: -1 })
      .limit(1000)
      .lean();
  }

  formatToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const rows = data.map((item) =>
      headers
        .map((h) => {
          const val = item[h];
          if (val === null || val === undefined) return '';
          if (typeof val === 'object') return JSON.stringify(val);
          return String(val).replace(/"/g, '""');
        })
        .join(','),
    );

    return [headers.join(','), ...rows].join('\n');
  }

  async exportToJSON(reportType: string, params: any): Promise<any> {
    let data: any[];
    const { startDate, endDate, ...rest } = params;

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    switch (reportType) {
      case 'activity':
        data = await this.getUserActivityByPeriod(
          start,
          end,
          rest.period || 'day',
        );
        break;
      case 'top-users':
        data = await this.getTopActiveUsers(rest.limit || 10, start, end);
        break;
      case 'crud':
        data = await this.getCrudStatistics(start, end);
        break;
      case 'trends':
        data = await this.getTimeSeriesTrends(
          start,
          end,
          rest.groupBy || 'day',
        );
        break;
      case 'anomalies':
        data = await this.detectAnomalies(rest.threshold || 3);
        break;
      default:
        data = [];
    }

    return {
      reportType,
      generatedAt: new Date(),
      params: { startDate: start, endDate: end, ...rest },
      data,
    };
  }

  async exportToCSV(reportType: string, params: any): Promise<string> {
    const jsonData = await this.exportToJSON(reportType, params);
    return this.formatToCSV(jsonData.data);
  }
}
