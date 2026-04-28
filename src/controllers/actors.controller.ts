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
import { ActorsService } from '../services/actors.service';
import { CreateActorDto } from '../dto/create-actor.dto';
import { UpdateActorDto } from '../dto/update-actor.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('actors')
export class ActorsController {
  constructor(private readonly actorsService: ActorsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() dto: CreateActorDto, @Req() req: any) {
    const userId = req.user?.userId;
    return this.actorsService.createActor(dto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateActorDto,
    @Req() req: any,
  ) {
    const userId = req.user?.userId;
    return this.actorsService.updateActor(id, dto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  delete(@Param('id') id: number, @Req() req: any) {
    const userId = req.user?.userId;
    return this.actorsService.deleteActor(id, userId);
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
    return this.actorsService.addActorToMovie(
      movieId,
      actorId,
      body.characterName,
    );
  }

  @Delete('link/:movieId/:actorId')
  removeActorFromMovie(
    @Param('movieId') movieId: number,
    @Param('actorId') actorId: number,
  ) {
    return this.actorsService.removeActorFromMovie(movieId, actorId);
  }

  @Get(':id/movies')
  getActorMovies(@Param('id') actorId: number) {
    return this.actorsService.getActorMovies(actorId);
  }
}
