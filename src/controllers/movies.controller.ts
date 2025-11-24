import { Controller, Post, Get, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { MoviesService } from '../services/movies.service';
import { CreateMovieDto } from '../dto/create-movie.dto';
import { UpdateMovieDto } from '../dto/update-movie.dto';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

@Get('search')
  search(@Query('title') title: string) {
    return this.moviesService.searchMoviesByTitle(title);
  }
  
  @Post()
  create(@Body() dto: CreateMovieDto) {
    return this.moviesService.createMovie(dto);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateMovieDto) {
    return this.moviesService.updateMovie(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.moviesService.deleteMovie(id);
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
  filterByRegion(@Query('language') language?: string, @Query('country') country?: string) {
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