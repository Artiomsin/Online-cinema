import { Module } from '@nestjs/common';
import { ViewsService } from '../services/views.service';
import { ViewsController } from '../controllers/views.controller';
import { ActionLogModule } from './action-log.module';

@Module({
  imports: [ActionLogModule],
  controllers: [ViewsController],
  providers: [ViewsService],
  exports: [ViewsService, ActionLogModule],
})
export class ViewsModule {}
