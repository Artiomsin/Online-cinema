import { Module } from '@nestjs/common';
import { MoviesService } from '../services/movies.service';
import { MoviesController } from '../controllers/movies.controller';
import { ActionLogModule } from './action-log.module';
import { SessionModule } from './session.module';

@Module({
  imports: [ActionLogModule, SessionModule],
  controllers: [MoviesController],
  providers: [MoviesService],
  exports: [MoviesService],
})
export class MoviesModule {}
