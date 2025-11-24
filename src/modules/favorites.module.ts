
import { Module } from '@nestjs/common';
import { FavoritesService } from '../services/favorites.service';
import { FavoritesController } from '../controllers/favorites.controller';
import { AuthModule } from './auth.module';

@Module({
  imports: [AuthModule], 
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService]
})
export class FavoritesModule {}
