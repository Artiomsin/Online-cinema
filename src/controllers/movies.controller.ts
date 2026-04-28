import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MoviesService } from '../services/movies.service';
import { CreateMovieDto } from '../dto/create-movie.dto';
import { UpdateMovieDto } from '../dto/update-movie.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() dto: CreateMovieDto, @Req() req: any) {
    const userId = req.user?.userId;
    return this.moviesService.createMovie(dto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateMovieDto,
    @Req() req: any,
  ) {
    const userId = req.user?.userId;
    return this.moviesService.updateMovie(id, dto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  delete(@Param('id') id: number, @Req() req: any) {
    const userId = req.user?.userId;
    return this.moviesService.deleteMovie(id, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.moviesService.findMovieById(id);
  }

  @Get()
  findAll() {
    return this.moviesService.findAllMovies();
  }

  @Get('genre/:genreId')
  filterByGenre(@Param('genreId') genreId: number) {
    return this.moviesService.filterMoviesByGenre(genreId);
  }

  @Get('region')
  filterByRegion(
    @Query('language') language?: string,
    @Query('country') country?: string,
  ) {
    return this.moviesService.filterMoviesByRegion(language, country);
  }

  @Get(':id/genres')
  getGenres(@Param('id') id: number) {
    return this.moviesService.getGenresForMovie(id);
  }

  @Get(':id/actors')
  getActors(@Param('id') id: number) {
    return this.moviesService.getActorsForMovie(id);
  }
}
