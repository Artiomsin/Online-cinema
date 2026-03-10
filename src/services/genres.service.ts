import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { CreateGenreDto } from '../dto/create-genre.dto';
import { UpdateGenreDto } from '../dto/update-genre.dto';
import { CacheService, CACHE_KEYS, CACHE_TTL } from './cache.service';

@Injectable()
export class GenresService {
  constructor(
    @Inject('DB') private readonly db: any,
    private readonly cacheService: CacheService,
  ) {}

  // --- CREATE ---
  async createGenre(dto: CreateGenreDto) {
    const result = await this.db.execute(sql`
      INSERT INTO "Genre"."genres" (name, description)
      VALUES (${dto.name}, ${dto.description})
      RETURNING id, name, description;
    `);

    await this.cacheService.invalidateGenresCache();
    return result.rows[0];
  }

  // --- UPDATE ---
  async updateGenre(id: number, dto: UpdateGenreDto) {
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
    return result.rows[0];
  }

  // --- DELETE ---
  async deleteGenre(id: number) {
    const result = await this.db.execute(sql`
      DELETE FROM "Genre"."genres"
      WHERE id = ${id}
      RETURNING id, name, description;
    `);

    if (result.rows.length === 0)
      throw new NotFoundException(`Genre ${id} not found`);

    await this.cacheService.invalidateGenresCache();
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
