import { Injectable, Inject } from '@nestjs/common';
import { views } from '../database/models/View';
import { eq, and } from 'drizzle-orm';
import { StartViewDto } from '../dto/start-view.dto';
import { UpdateStopPositionDto } from '../dto/update-stop-position.dto';
import { CacheService } from './cache.service';
import { ActionLogService } from './action-log.service';
import { UserActionType } from '../database/models/ActionLogMongo';
import { Logger } from '@nestjs/common';

@Injectable()
export class ViewsService {
  private readonly logger = new Logger(ViewsService.name);

  constructor(
    @Inject('DB') private readonly db: any,
    private readonly cacheService: CacheService,
    private readonly actionLogService: ActionLogService,
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

    if (this.actionLogService) {
      try {
        const result = await this.actionLogService.logUserAction(
          dto.userId,
          UserActionType.VIEW,
          `Started watching movie: ${dto.movieId}`,
          { movieId: dto.movieId },
        );
        this.logger.log(
          `View logged for user ${dto.userId}, movie ${dto.movieId}, result: ${result?._id}`,
        );
      } catch (e) {
        this.logger.error(
          `Failed to log view: ${e.message}, stack: ${e.stack}`,
        );
      }
    } else {
      this.logger.warn(`ActionLogService is not injected!`);
    }

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
