import { Module } from '@nestjs/common';
import { MoviesService } from '../services/movies.service';
import { MoviesController } from '../controllers/movies.controller';


@Module({
  controllers: [MoviesController],
  providers: [MoviesService],
  exports: [MoviesService], 
})
export class MoviesModule {}