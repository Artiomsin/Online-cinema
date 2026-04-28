import { Module } from '@nestjs/common';
import { CommentsService } from '../services/comments.service';
import { CommentsController } from '../controllers/comments.controller';
import { AuthModule } from './auth.module';
import { SessionModule } from './session.module';

@Module({
  imports: [AuthModule, SessionModule],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
