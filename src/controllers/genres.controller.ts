import { Controller, Post, Get, Put, Delete, Param, Body } from '@nestjs/common';
import { GenresService } from '../services/genres.service';
import { CreateGenreDto } from '../dto/create-genre.dto';
import { UpdateGenreDto } from '../dto/update-genre.dto';

@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Post()
  create(@Body() dto: CreateGenreDto) {
    return this.genresService.createGenre(dto);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateGenreDto) {
    return this.genresService.updateGenre(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.genresService.deleteGenre(id);
  }

  @Get()
  findAll() {
    return this.genresService.findAllGenres();
  }

  @Post(':movieId/:genreId')
  addGenreToMovie(@Param('movieId') movieId: number, @Param('genreId') genreId: number) {
    return this.genresService.addGenreToMovie(movieId, genreId);
  }

  @Delete(':movieId/:genreId')
  removeGenreFromMovie(@Param('movieId') movieId: number, @Param('genreId') genreId: number) {
    return this.genresService.removeGenreFromMovie(movieId, genreId);
  }
}