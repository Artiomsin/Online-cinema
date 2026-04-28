import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { comments } from '../database/models/Comment';
import { eq } from 'drizzle-orm';
import { AddCommentDto } from '../dto/add-comment.dto';
import { SessionService } from './session.service';

@Injectable()
export class CommentsService implements OnModuleInit {
  constructor(
    @Inject('DB') private readonly db: any,
    private readonly sessionService?: SessionService,
  ) {}

  async onModuleInit() {
    if (this.sessionService) {
      this.sessionService.subscribe('movie_deleted', async (message) => {
        const data = JSON.parse(message);
        console.log(`📥 CommentsService: Получено событие ${data.eventType}`, data.data);
      });
    }
  }

  async addComment(dto: AddCommentDto) {
    const [comment] = await this.db
      .insert(comments)
      .values({
        userId: dto.userId,
        movieId: dto.movieId,
        rating: dto.rating,
        commentText: dto.commentText,
        commentDate: new Date(),
      })
      .returning();

    if (this.sessionService) {
      await this.sessionService.publishChange('comment_added', {
        movieId: dto.movieId,
        userId: dto.userId,
      });
    }

    return comment;
  }

  async getCommentsByMovie(movieId: number) {
    return this.db.select().from(comments).where(eq(comments.movieId, movieId));
  }

  async getCommentsByUser(userId: number) {
    return this.db.select().from(comments).where(eq(comments.userId, userId));
  }

  async getAverageRating(movieId: number) {
    const rows = await this.db
      .select({ rating: comments.rating })
      .from(comments)
      .where(eq(comments.movieId, movieId));

    if (rows.length === 0) return { movieId, averageRating: null };

    const avg = rows.reduce((sum, r) => sum + r.rating, 0) / rows.length;
    return { movieId, averageRating: avg };
  }
}
