import { Injectable, Inject } from '@nestjs/common';
import { views } from '../database/models/View';
import { eq, and } from 'drizzle-orm';
import { StartViewDto } from '../dto/start-view.dto';
import { UpdateStopPositionDto } from '../dto/update-stop-position.dto';
import { CacheService } from './cache.service';

@Injectable()
export class ViewsService {
  constructor(
    @Inject('DB') private readonly db: any,
    private readonly cacheService: CacheService,
  ) {}

  async startView(dto: StartViewDto) {
    const [view] = await this.db
      .insert(views)
      .values({
        userId: dto.userId,
        movieId: dto.movieId,
        viewDate: new Date(),
        stopPosition: 0,
      })
      .returning();

    await this.cacheService.delByPattern(`recommendations:*:${dto.userId}`);
    return view;
  }

  async updateStopPosition(dto: UpdateStopPositionDto) {
    const [updated] = await this.db
      .update(views)
      .set({ stopPosition: dto.position })
      .where(and(eq(views.userId, dto.userId), eq(views.movieId, dto.movieId)))
      .returning();
    return updated;
  }

  async getUserViews(userId: number) {
    return this.db.select().from(views).where(eq(views.userId, userId));
  }
}
