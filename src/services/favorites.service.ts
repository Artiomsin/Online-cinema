import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { AddFavoriteDto } from '../dto/add-favorite.dto';
import { RemoveFavoriteDto } from '../dto/remove-favorite.dto';
import { CheckFavoriteDto } from '../dto/check-favorite.dto';
import { CacheService } from './cache.service';

@Injectable()
export class FavoritesService {
  constructor(
    @Inject('DB') private readonly db: any,
    private readonly cacheService: CacheService,
  ) {}

  // --- ADD FAVORITE ---
  async addFavorite(dto: AddFavoriteDto & { userId: number }) {
    const today = new Date().toISOString().split('T')[0];
    const result = await this.db.execute(sql`
      INSERT INTO "Favorites"."favorites" (user_id, movie_id, added_date)
      VALUES (${dto.userId}, ${dto.movieId}, ${today})
      RETURNING id, user_id AS "userId", movie_id AS "movieId", added_date AS "addedDate";
    `);

    await this.cacheService.delByPattern(`recommendations:*:${dto.userId}`);
    return result.rows[0];
  }

  // --- REMOVE FAVORITE ---
  async removeFavorite(dto: RemoveFavoriteDto & { userId: number }) {
    const result = await this.db.execute(sql`
      DELETE FROM "Favorites"."favorites"
      WHERE user_id = ${dto.userId} AND movie_id = ${dto.movieId}
      RETURNING id, user_id AS "userId", movie_id AS "movieId", added_date AS "addedDate";
    `);

    if (result.rows.length === 0) {
      throw new NotFoundException(
        `Movie ${dto.movieId} not found in favorites for user ${dto.userId}`,
      );
    }

    await this.cacheService.delByPattern(`recommendations:*:${dto.userId}`);
    return result.rows[0];
  }

  // --- CHECK FAVORITE ---
  async isMovieInFavorites(dto: CheckFavoriteDto & { userId: number }) {
    const result = await this.db.execute(sql`
      SELECT id
      FROM "Favorites"."favorites"
      WHERE user_id = ${dto.userId} AND movie_id = ${dto.movieId};
    `);

    return { isFavorite: result.rows.length > 0 };
  }

  // --- GET USER FAVORITES ---
  async getUserFavorites(userId: number) {
    const result = await this.db.execute(sql`
      SELECT 
        m.id AS "movieId",
        m.title,
        m.description,
        f.added_date AS "addedDate"
      FROM "Favorites"."favorites" f
      INNER JOIN "Movie"."movies" m ON f.movie_id = m.id
      WHERE f.user_id = ${userId};
    `);

    return result.rows;
  }
}
