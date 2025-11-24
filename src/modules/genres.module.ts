import { Module } from '@nestjs/common';
import { GenresService } from '../services/genres.service';
import { GenresController } from '../controllers/genres.controller';

@Module({
  controllers: [GenresController],
  providers: [GenresService],
  exports: [GenresService],
})
export class GenresModule {}