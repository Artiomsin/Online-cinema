import { Injectable, Inject } from '@nestjs/common';
import { actionLogs, NewActionLog } from '../database/schema';
import { CreateActionLogDto } from '../dto/create-action-log.dto';

@Injectable()
export class ActionLogService {
  constructor(@Inject('DB') private readonly db: any) {}

  async logAction(dto: CreateActionLogDto) {
    const newLog: NewActionLog = {
      userId: dto.userId,
      action: dto.action,
     
    };

    const [log] = await this.db.insert(actionLogs).values(newLog).returning();
    return log;
  }
}
