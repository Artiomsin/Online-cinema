import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActionLogService } from '../services/action-log.service';
import { ActionLogController } from '../controllers/action-log.controller';
import { ActionLog, ActionLogSchema } from '../database/models/ActionLogMongo';
import { AggregationReportsService } from '../services/aggregation-reports.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ActionLog.name, schema: ActionLogSchema },
    ]),
  ],
  controllers: [ActionLogController],
  providers: [ActionLogService, AggregationReportsService],
  exports: [ActionLogService, AggregationReportsService],
})
export class ActionLogModule {}
