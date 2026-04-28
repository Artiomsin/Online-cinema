import { Module } from '@nestjs/common';
import { RecommendationService } from '../services/recommendation.service';
import { RecommendationController } from '../controllers/recommendation.controller';
import { AuthModule } from './auth.module';

@Module({
  imports: [AuthModule],
  controllers: [RecommendationController],
  providers: [RecommendationService],
  exports: [RecommendationService],
})
export class RecommendationModule {}
