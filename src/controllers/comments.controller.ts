import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CommentsService } from '../services/comments.service';
import { AddCommentDto } from '../dto/add-comment.dto';
import { Roles } from '../services/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../services/roles.guard';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('user')
  @Post()
  async addComment(@Req() req: any, @Body() dto: AddCommentDto) {
    const userId = Number(req.user.userId);
    return this.commentsService.addComment({
      ...dto,
      userId,
    });
  }

  @Get('movie/:movieId')
  getCommentsByMovie(@Param('movieId') movieId: number) {
    return this.commentsService.getCommentsByMovie(movieId);
  }

  @Get('user/:userId')
  getCommentsByUser(@Param('userId') userId: number) {
    return this.commentsService.getCommentsByUser(userId);
  }

  @Get('movie/:movieId/average-rating')
  getAverageRating(@Param('movieId') movieId: number) {
    return this.commentsService.getAverageRating(movieId);
  }
}
