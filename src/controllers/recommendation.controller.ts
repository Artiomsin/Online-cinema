import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { RecommendationService } from '../services/recommendation.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('recommendations')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('favorites')
  async recommendByFavorites(@Req() req: any) {
    const userId = req.user.userId;
    return this.recommendationService.recommendMoviesByFavorites(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('history')
  async recommendByHistory(@Req() req: any) {
    const userId = req.user.userId;
    return this.recommendationService.recommendMoviesByHistory(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('genres')
  async notifyNewMovies(@Req() req: any) {
    const userId = req.user.userId;
    return this.recommendationService.notifyNewMoviesInFavoriteGenres(userId);
  }

  @Get('similar/:movieId')
  async getSimilar(@Param('movieId') movieId: string) {
    return this.recommendationService.getSimilarMovies(Number(movieId));
  }
}
