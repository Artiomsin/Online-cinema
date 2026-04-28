import { Inject, Injectable } from '@nestjs/common';
import { sql, inArray, eq, and, or } from 'drizzle-orm';
import {
  favorites,
  views,
  movies,
  movieGenres,
  movieActors,
} from '../database/schema';
import { CacheService, CACHE_TTL } from './cache.service';

@Injectable()
export class RecommendationService {
  constructor(
    @Inject('DB') private readonly db: any,
    private readonly cacheService: CacheService,
  ) {}

  // 1. Рекомендации на основе избранного
  async recommendMoviesByFavorites(userId: number) {
    const cacheKey = `recommendations:favorites:${userId}`;
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const favGenreIds: number[] = await this.db
          .select({ genreId: movieGenres.genreId })
          .from(favorites)
          .innerJoin(movieGenres, eq(favorites.movieId, movieGenres.movieId))
          .where(eq(favorites.userId, userId))
          .then((rows) => rows.map((r) => r.genreId));

        if (favGenreIds.length === 0) return [];

        return this.db
          .select({
            id: movies.id,
            title: movies.title,
            posterUrl: movies.posterUrl,
            releaseYear: movies.releaseYear,
          })
          .from(movies)
          .innerJoin(movieGenres, eq(movies.id, movieGenres.movieId))
          .where(inArray(movieGenres.genreId, favGenreIds))
          .groupBy(movies.id);
      },
      CACHE_TTL.ANALYTICS,
    );
  }

  // 2. Рекомендации на основе истории просмотров
  async recommendMoviesByHistory(userId: number) {
    const cacheKey = `recommendations:history:${userId}`;
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const historyGenreIds: number[] = await this.db
          .select({ genreId: movieGenres.genreId })
          .from(views)
          .innerJoin(movieGenres, eq(views.movieId, movieGenres.movieId))
          .where(eq(views.userId, userId))
          .then((rows) => rows.map((r) => r.genreId));

        if (historyGenreIds.length === 0) return [];

        return this.db
          .select({
            id: movies.id,
            title: movies.title,
            posterUrl: movies.posterUrl,
            releaseYear: movies.releaseYear,
          })
          .from(movies)
          .innerJoin(movieGenres, eq(movies.id, movieGenres.movieId))
          .where(inArray(movieGenres.genreId, historyGenreIds))
          .groupBy(movies.id);
      },
      CACHE_TTL.ANALYTICS,
    );
  }

  async notifyNewMoviesInFavoriteGenres(userId: number) {
    const cacheKey = `recommendations:new:${userId}`;
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const favGenreIds: number[] = await this.db
          .select({ genreId: movieGenres.genreId })
          .from(favorites)
          .innerJoin(movieGenres, eq(favorites.movieId, movieGenres.movieId))
          .where(eq(favorites.userId, userId))
          .then((rows) => rows.map((r) => r.genreId));

        if (favGenreIds.length === 0) return [];

        return this.db
          .select({
            id: movies.id,
            title: movies.title,
            posterUrl: movies.posterUrl,
            releaseYear: movies.releaseYear,
          })
          .from(movies)
          .innerJoin(movieGenres, eq(movies.id, movieGenres.movieId))
          .where(
            and(
              inArray(movieGenres.genreId, favGenreIds),
              sql`${movies.releaseYear} >= EXTRACT(YEAR FROM NOW()) - 1`,
            ),
          )
          .groupBy(movies.id);
      },
      CACHE_TTL.ANALYTICS,
    );
  }

  async getSimilarMovies(movieId: number) {
    const cacheKey = `recommendations:similar:${movieId}`;
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const genres: number[] = await this.db
          .select({ genreId: movieGenres.genreId })
          .from(movieGenres)
          .where(eq(movieGenres.movieId, movieId))
          .then((rows) => rows.map((r) => r.genreId));

        const actors: number[] = await this.db
          .select({ actorId: movieActors.actorId })
          .from(movieActors)
          .where(eq(movieActors.movieId, movieId))
          .then((rows) => rows.map((r) => r.actorId));

        if (genres.length === 0 && actors.length === 0) return [];

        return this.db
          .select({
            id: movies.id,
            title: movies.title,
            posterUrl: movies.posterUrl,
            releaseYear: movies.releaseYear,
          })
          .from(movies)
          .leftJoin(movieGenres, eq(movies.id, movieGenres.movieId))
          .leftJoin(movieActors, eq(movies.id, movieActors.movieId))
          .where(
            and(
              sql`${movies.id} <> ${movieId}`,
              or(
                inArray(movieGenres.genreId, genres),
                inArray(movieActors.actorId, actors),
              ),
            ),
          )
          .groupBy(movies.id);
      },
      CACHE_TTL.ANALYTICS,
    );
  }
}
