import { Module } from '@nestjs/common';
import { GenresService } from '../services/genres.service';
import { GenresController } from '../controllers/genres.controller';
import { ActionLogModule } from './action-log.module';
import { SessionModule } from './session.module';

@Module({
  imports: [ActionLogModule, SessionModule],
  controllers: [GenresController],
  providers: [GenresService],
  exports: [GenresService],
})
export class GenresModule {}
