import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { GenresService } from '../services/genres.service';
import { CreateGenreDto } from '../dto/create-genre.dto';
import { UpdateGenreDto } from '../dto/update-genre.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() dto: CreateGenreDto, @Req() req: any) {
    const userId = req.user?.userId;
    return this.genresService.createGenre(dto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateGenreDto,
    @Req() req: any,
  ) {
    const userId = req.user?.userId;
    return this.genresService.updateGenre(id, dto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  delete(@Param('id') id: number, @Req() req: any) {
    const userId = req.user?.userId;
    return this.genresService.deleteGenre(id, userId);
  }

  @Get()
  findAll() {
    return this.genresService.findAllGenres();
  }

  @Post(':movieId/:genreId')
  addGenreToMovie(
    @Param('movieId') movieId: number,
    @Param('genreId') genreId: number,
  ) {
    return this.genresService.addGenreToMovie(movieId, genreId);
  }

  @Delete(':movieId/:genreId')
  removeGenreFromMovie(
    @Param('movieId') movieId: number,
    @Param('genreId') genreId: number,
  ) {
    return this.genresService.removeGenreFromMovie(movieId, genreId);
  }
}
