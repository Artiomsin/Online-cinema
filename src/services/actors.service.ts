import { Injectable, Inject, NotFoundException, OnModuleInit } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { CreateActorDto } from '../dto/create-actor.dto';
import { UpdateActorDto } from '../dto/update-actor.dto';
import { CacheService, CACHE_KEYS, CACHE_TTL } from './cache.service';
import { ActionLogService } from './action-log.service';
import { SessionService } from './session.service';
import { UserActionType } from '../database/models/ActionLogMongo';

@Injectable()
export class ActorsService implements OnModuleInit {
  constructor(
    @Inject('DB') private readonly db: any,
    private readonly cacheService: CacheService,
    private readonly actionLogService?: ActionLogService,
    private readonly sessionService?: SessionService,
  ) {}

  async onModuleInit() {
    if (this.sessionService) {
      this.sessionService.subscribe('actor_deleted', async (message) => {
        const data = JSON.parse(message);
        console.log(`📥 ActorsService: Получено событие ${data.eventType}`, data.data);
        await this.cacheService.invalidateActorsCache();
      });

      this.sessionService.subscribe('actor_created', async (message) => {
        const data = JSON.parse(message);
        console.log(`📥 ActorsService: Получено событие ${data.eventType}`, data.data);
        await this.cacheService.invalidateActorsCache();
      });
    }
  }

  // --- CREATE ---
  async createActor(dto: CreateActorDto, userId?: number) {
    const result = await this.db.execute(sql`
      INSERT INTO "Actor"."actors" (first_name, last_name, birth_date, biography)
      VALUES (${dto.firstName}, ${dto.lastName}, ${dto.birthDate}, ${dto.biography})
      RETURNING id, first_name AS "firstName", last_name AS "lastName", birth_date AS "birthDate", biography;
    `);

    await this.cacheService.invalidateActorsCache();

    if (this.actionLogService) {
      await this.actionLogService.logUserAction(
        userId,
        UserActionType.CREATE,
        `Создан актёр: ${dto.firstName} ${dto.lastName}`,
        { actorId: result.rows[0]?.id, ...dto },
      );
    }

    if (this.sessionService) {
      await this.sessionService.publishChange('actor_created', {
        actorId: result.rows[0]?.id,
        name: `${dto.firstName} ${dto.lastName}`,
      });
    }

    return result.rows[0];
  }

  // --- UPDATE ---
  async updateActor(id: number, dto: UpdateActorDto, userId?: number) {
    const result = await this.db.execute(sql`
      UPDATE "Actor"."actors"
      SET 
        first_name = COALESCE(${dto.firstName}, first_name),
        last_name  = COALESCE(${dto.lastName}, last_name),
        birth_date = COALESCE(${dto.birthDate}, birth_date),
        biography  = COALESCE(${dto.biography}, biography)
      WHERE id = ${id}
      RETURNING id, first_name AS "firstName", last_name AS "lastName", birth_date AS "birthDate", biography;
    `);

    if (result.rows.length === 0)
      throw new NotFoundException(`Actor ${id} not found`);

    await this.cacheService.invalidateActorsCache();

    if (this.actionLogService) {
      await this.actionLogService.logUserAction(
        userId,
        UserActionType.UPDATE,
        `Обновлён актёр: ${result.rows[0].firstName} ${result.rows[0].lastName}`,
        { actorId: id, ...dto },
      );
    }

    if (this.sessionService) {
      await this.sessionService.publishChange('actor_updated', {
        actorId: id,
        name: `${result.rows[0].firstName} ${result.rows[0].lastName}`,
      });
    }

    return result.rows[0];
  }

  // --- DELETE ---
  async deleteActor(id: number, userId?: number) {
    const result = await this.db.execute(sql`
      DELETE FROM "Actor"."actors"
      WHERE id = ${id}
      RETURNING id, first_name AS "firstName", last_name AS "lastName", birth_date AS "birthDate", biography;
    `);

    if (result.rows.length === 0)
      throw new NotFoundException(`Actor ${id} not found`);

    await this.cacheService.invalidateActorsCache();

    if (this.actionLogService) {
      await this.actionLogService.logUserAction(
        userId,
        UserActionType.DELETE,
        `Удалён актёр: ${result.rows[0].firstName} ${result.rows[0].lastName}`,
        { actorId: id },
      );
    }

    if (this.sessionService) {
      await this.sessionService.publishChange('actor_deleted', { actorId: id });
    }

    return result.rows[0];
  }

  // --- FIND BY ID ---
  async findActorById(id: number) {
    const result = await this.db.execute(sql`
      SELECT id, first_name AS "firstName", last_name AS "lastName", birth_date AS "birthDate", biography
      FROM "Actor"."actors"
      WHERE id = ${id};
    `);

    if (result.rows.length === 0)
      throw new NotFoundException(`Actor ${id} not found`);
    return result.rows[0];
  }

  // --- FIND ALL ---
  async findAllActors() {
    return this.cacheService.getOrSet(
      CACHE_KEYS.ACTORS_LIST,
      async () => {
        const result = await this.db.execute(sql`
          SELECT id, first_name AS "firstName", last_name AS "lastName", birth_date AS "birthDate", biography
          FROM "Actor"."actors";
        `);
        return result.rows;
      },
      CACHE_TTL.ACTORS_LIST,
    );
  }

  // --- ADD ACTOR TO MOVIE ---
  async addActorToMovie(
    movieId: number,
    actorId: number,
    characterName: string,
  ) {
    const result = await this.db.execute(sql`
      INSERT INTO "Movie_Actor"."movie_actors" (movie_id, actor_id, character_name)
      VALUES (${movieId}, ${actorId}, ${characterName})
      RETURNING id, movie_id AS "movieId", actor_id AS "actorId", character_name AS "characterName";
    `);

    await this.cacheService.invalidateMoviesCache();
    return result.rows[0];
  }

  // --- REMOVE ACTOR FROM MOVIE ---
  async removeActorFromMovie(movieId: number, actorId: number) {
    const result = await this.db.execute(sql`
      DELETE FROM "Movie_Actor"."movie_actors"
      WHERE movie_id = ${movieId} AND actor_id = ${actorId}
      RETURNING id, movie_id AS "movieId", actor_id AS "actorId", character_name AS "characterName";
    `);

    if (result.rows.length === 0)
      throw new NotFoundException(
        `Actor ${actorId} not linked to movie ${movieId}`,
      );

    await this.cacheService.invalidateMoviesCache();
    return result.rows[0];
  }

  // --- GET ACTOR MOVIES ---
  async getActorMovies(actorId: number) {
    return this.cacheService.getOrSet(
      CACHE_KEYS.MOVIES_BY_ACTOR(actorId),
      async () => {
        const result = await this.db.execute(sql`
          SELECT
            m.id AS movie_id,
            m.title,
            m.release_year,
            ma.character_name,
            g.name AS genre_name
          FROM "Movie_Actor"."movie_actors" ma
          JOIN "Movie"."movies" m ON ma.movie_id = m.id
          LEFT JOIN "Movie_Genre"."movie_genres" mg ON m.id = mg.movie_id
          LEFT JOIN "Genre"."genres" g ON mg.genre_id = g.id
          WHERE ma.actor_id = ${actorId};
        `);

        const rows = result.rows;

        const grouped = new Map<
          number,
          {
            id: number;
            title: string;
            releaseYear: number;
            characterName: string;
            genres: string[];
          }
        >();

        for (const row of rows) {
          const movieId = row.movie_id;
          if (!grouped.has(movieId)) {
            grouped.set(movieId, {
              id: movieId,
              title: row.title,
              releaseYear: row.release_year,
              characterName: row.character_name,
              genres: row.genre_name ? [row.genre_name] : [],
            });
          } else {
            const movie = grouped.get(movieId)!;
            if (row.genre_name && !movie.genres.includes(row.genre_name)) {
              movie.genres.push(row.genre_name);
            }
          }
        }

        return Array.from(grouped.values());
      },
      CACHE_TTL.MOVIES_BY_ACTOR,
    );
  }
}
