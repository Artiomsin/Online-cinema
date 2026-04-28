import { Injectable, Inject, NotFoundException, OnModuleInit } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { CreateGenreDto } from '../dto/create-genre.dto';
import { UpdateGenreDto } from '../dto/update-genre.dto';
import { CacheService, CACHE_KEYS, CACHE_TTL } from './cache.service';
import { ActionLogService } from './action-log.service';
import { SessionService } from './session.service';
import { UserActionType } from '../database/models/ActionLogMongo';

@Injectable()
export class GenresService implements OnModuleInit {
  constructor(
    @Inject('DB') private readonly db: any,
    private readonly cacheService: CacheService,
    private readonly actionLogService?: ActionLogService,
    private readonly sessionService?: SessionService,
  ) {}

  async onModuleInit() {
    if (this.sessionService) {
      this.sessionService.subscribe('genre_deleted', async (message) => {
        const data = JSON.parse(message);
        console.log(`📥 GenresService: Получено событие ${data.eventType}`, data.data);
        await this.cacheService.invalidateGenresCache();
      });

      this.sessionService.subscribe('genre_created', async (message) => {
        const data = JSON.parse(message);
        console.log(`📥 GenresService: Получено событие ${data.eventType}`, data.data);
        await this.cacheService.invalidateGenresCache();
      });
    }
  }

  // --- CREATE ---
  async createGenre(dto: CreateGenreDto, userId?: number) {
    const result = await this.db.execute(sql`
      INSERT INTO "Genre"."genres" (name, description)
      VALUES (${dto.name}, ${dto.description})
      RETURNING id, name, description;
    `);

    await this.cacheService.invalidateGenresCache();

    if (this.actionLogService) {
      await this.actionLogService.logUserAction(
        userId,
        UserActionType.CREATE,
        `Создан жанр: ${dto.name}`,
        { genreId: result.rows[0]?.id, ...dto },
      );
    }

    if (this.sessionService) {
      await this.sessionService.publishChange('genre_created', {
        genreId: result.rows[0]?.id,
        name: dto.name,
      });
    }

    return result.rows[0];
  }

  // --- UPDATE ---
  async updateGenre(id: number, dto: UpdateGenreDto, userId?: number) {
    const result = await this.db.execute(sql`
      UPDATE "Genre"."genres"
      SET 
        name = COALESCE(${dto.name}, name),
        description = COALESCE(${dto.description}, description)
      WHERE id = ${id}
      RETURNING id, name, description;
    `);

    if (result.rows.length === 0)
      throw new NotFoundException(`Genre ${id} not found`);

    await this.cacheService.invalidateGenresCache();

    if (this.actionLogService) {
      await this.actionLogService.logUserAction(
        userId,
        UserActionType.UPDATE,
        `Обновлён жанр: ${result.rows[0].name}`,
        { genreId: id, ...dto },
      );
    }

    if (this.sessionService) {
      await this.sessionService.publishChange('genre_updated', {
        genreId: id,
        name: result.rows[0].name,
      });
    }

    return result.rows[0];
  }

  // --- DELETE ---
  async deleteGenre(id: number, userId?: number) {
    const result = await this.db.execute(sql`
      DELETE FROM "Genre"."genres"
      WHERE id = ${id}
      RETURNING id, name, description;
    `);

    if (result.rows.length === 0)
      throw new NotFoundException(`Genre ${id} not found`);

    await this.cacheService.invalidateGenresCache();

    if (this.actionLogService) {
      await this.actionLogService.logUserAction(
        userId,
        UserActionType.DELETE,
        `Удалён жанр: ${result.rows[0].name}`,
        { genreId: id },
      );
    }

    if (this.sessionService) {
      await this.sessionService.publishChange('genre_deleted', { genreId: id });
    }

    return result.rows[0];
  }

  // --- FIND ALL ---
  async findAllGenres() {
    return this.cacheService.getOrSet(
      CACHE_KEYS.GENRES_LIST,
      async () => {
        const result = await this.db.execute(sql`
          SELECT id, name, description
          FROM "Genre"."genres";
        `);
        return result.rows;
      },
      CACHE_TTL.GENRES_LIST,
    );
  }

  // --- ADD GENRE TO MOVIE ---
  async addGenreToMovie(movieId: number, genreId: number) {
    const result = await this.db.execute(sql`
      INSERT INTO "Movie_Genre"."movie_genres" (movie_id, genre_id)
      VALUES (${movieId}, ${genreId})
      RETURNING id, movie_id AS "movieId", genre_id AS "genreId";
    `);

    await this.cacheService.invalidateMoviesCache();
    return result.rows[0];
  }

  // --- REMOVE GENRE FROM MOVIE ---
  async removeGenreFromMovie(movieId: number, genreId: number) {
    const result = await this.db.execute(sql`
      DELETE FROM "Movie_Genre"."movie_genres"
      WHERE movie_id = ${movieId} AND genre_id = ${genreId}
      RETURNING id, movie_id AS "movieId", genre_id AS "genreId";
    `);

    if (result.rows.length === 0)
      throw new NotFoundException(
        `Genre ${genreId} not linked to movie ${movieId}`,
      );

    await this.cacheService.invalidateMoviesCache();
    return result.rows[0];
  }
}
