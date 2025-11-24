import { Module } from '@nestjs/common';
import { ViewsService } from '../services/views.service';
import { ViewsController } from '../controllers/views.controller';

@Module({
  controllers: [ViewsController],
  providers: [ViewsService],
  exports: [ViewsService],
})
export class ViewsModule {}