import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FavoritesService } from '../services/favorites.service';
import { AddFavoriteDto } from '../dto/add-favorite.dto';
import { RemoveFavoriteDto } from '../dto/remove-favorite.dto';
import { CheckFavoriteDto } from '../dto/check-favorite.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async addFavorite(@Req() req: any, @Body() dto: AddFavoriteDto) {
    const userId = req.user.userId;
    return this.favoritesService.addFavorite({ ...dto, userId });
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete()
  async removeFavorite(@Req() req: any, @Body() dto: RemoveFavoriteDto) {
    const userId = req.user.userId;
    return this.favoritesService.removeFavorite({ ...dto, userId });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getMyFavorites(@Req() req: any) {
    return this.favoritesService.getUserFavorites(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('check')
  async isMovieInFavorites(@Req() req: any, @Body() dto: CheckFavoriteDto) {
    const userId = req.user.userId; // ← достаём из JWT
    return this.favoritesService.isMovieInFavorites({ ...dto, userId });
  }
}
