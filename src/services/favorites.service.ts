
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { favorites, movies } from '../database/schema';
import { eq, and } from 'drizzle-orm';
import { AddFavoriteDto } from '../dto/add-favorite.dto';
import { RemoveFavoriteDto } from '../dto/remove-favorite.dto';
import { CheckFavoriteDto } from '../dto/check-favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(@Inject('DB') private readonly db: any) {}

 async addFavorite(dto: AddFavoriteDto & { userId: number }) {
  const today = new Date().toISOString().split("T")[0]; // строка для date()
  const [favorite] = await this.db
    .insert(favorites)
    .values({
      userId: dto.userId,
      movieId: dto.movieId,
      addedDate: today,
    })
    .returning();

  return favorite;
}


  async removeFavorite(dto: RemoveFavoriteDto & { userId: number }) {
  const [deleted] = await this.db
    .delete(favorites)
    .where(
      and(
        eq(favorites.userId, dto.userId),
        eq(favorites.movieId, dto.movieId)
      )
    )
    .returning();

  if (!deleted) {
    throw new NotFoundException(
      `Movie ${dto.movieId} not found in favorites for user ${dto.userId}`
    );
  }
  return deleted;
}


  async isMovieInFavorites(dto: CheckFavoriteDto & { userId: number }) {
  const [favorite] = await this.db
    .select()
    .from(favorites)
    .where(
      and(
        eq(favorites.userId, dto.userId),
        eq(favorites.movieId, dto.movieId)
      )
    );

  return { isFavorite: !!favorite }; 
}


  async getUserFavorites(userId: number) {
    return await this.db
      .select({
        movieId: movies.id,
        title: movies.title,
        description: movies.description,
        addedDate: favorites.addedDate,
      })
      .from(favorites)
      .innerJoin(movies, eq(favorites.movieId, movies.id))
      .where(eq(favorites.userId, userId));
  }
}
