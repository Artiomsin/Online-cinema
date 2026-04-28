import { Module } from '@nestjs/common';
import { ActorsService } from '../services/actors.service';
import { ActorsController } from '../controllers/actors.controller';
import { ActionLogModule } from './action-log.module';
import { SessionModule } from './session.module';

@Module({
  imports: [ActionLogModule, SessionModule],
  controllers: [ActorsController],
  providers: [ActorsService],
  exports: [ActorsService],
})
export class ActorsModule {}
