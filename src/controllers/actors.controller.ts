import { Controller, Post, Get, Put, Delete, Param, Body } from '@nestjs/common';
import { ActorsService } from '../services/actors.service';
import { CreateActorDto } from '../dto/create-actor.dto';
import { UpdateActorDto } from '../dto/update-actor.dto';

@Controller('actors')
export class ActorsController {
  constructor(private readonly actorsService: ActorsService) {}

  @Post()
  create(@Body() dto: CreateActorDto) {
    return this.actorsService.createActor(dto);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateActorDto) {
    return this.actorsService.updateActor(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.actorsService.deleteActor(id);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.actorsService.findActorById(id);
  }

  @Get()
  findAll() {
    return this.actorsService.findAllActors();
  }

  @Post('link/:movieId/:actorId')
  addActorToMovie(
    @Param('movieId') movieId: number,
    @Param('actorId') actorId: number,
    @Body() body: { characterName: string },
  ) {
    return this.actorsService.addActorToMovie(movieId, actorId, body.characterName);
  }

  @Delete('link/:movieId/:actorId')
  removeActorFromMovie(@Param('movieId') movieId: number, @Param('actorId') actorId: number) {
    return this.actorsService.removeActorFromMovie(movieId, actorId);
  }

  @Get(':id/movies')
getActorMovies(@Param('id') actorId: number) {
  return this.actorsService.getActorMovies(actorId);
}

}