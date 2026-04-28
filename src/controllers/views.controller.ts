import { Controller, Post, Patch, Get, Body, Param } from '@nestjs/common';
import { ViewsService } from '../services/views.service';
import { StartViewDto } from '../dto/start-view.dto';
import { UpdateStopPositionDto } from '../dto/update-stop-position.dto';

@Controller('views')
export class ViewsController {
  constructor(private readonly viewsService: ViewsService) {}

  @Post()
  startView(@Body() dto: StartViewDto) {
    return this.viewsService.startView(dto);
  }

  @Patch()
  updateStopPosition(@Body() dto: UpdateStopPositionDto) {
    return this.viewsService.updateStopPosition(dto);
  }

  @Get(':userId')
  getUserViews(@Param('userId') userId: number) {
    return this.viewsService.getUserViews(userId);
  }
}
