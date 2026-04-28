import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export enum LogType {
  USER_ACTION = 'user_action',
  ERROR = 'error',
}

export enum UserActionType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTER = 'register',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
}

@Schema({ timestamps: true, collection: 'action_logs' })
export class ActionLog extends Document {
  @Prop({ required: true, enum: LogType })
  type: LogType;

  @Prop({ required: true, enum: LogLevel, default: LogLevel.INFO })
  level: LogLevel;

  @Prop({ enum: UserActionType, nullable: true })
  action?: UserActionType;

  @Prop({ type: Types.ObjectId, ref: 'User', nullable: true })
  userId?: number;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Object, nullable: true })
  metadata?: Record<string, any>;

  @Prop({ nullable: true })
  ipAddress?: string;

  @Prop({ nullable: true })
  userAgent?: string;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const ActionLogSchema = SchemaFactory.createForClass(ActionLog);

ActionLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

ActionLogSchema.index({ userId: 1, timestamp: -1 });
ActionLogSchema.index({ type: 1, timestamp: -1 });
ActionLogSchema.index({ level: 1, timestamp: -1 });
ActionLogSchema.index({ action: 1, timestamp: -1 });
