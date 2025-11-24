import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { genres, movieGenres } from '../database/schema';
import { eq, and } from 'drizzle-orm';
import { CreateGenreDto } from '../dto/create-genre.dto';
import { UpdateGenreDto } from '../dto/update-genre.dto';

@Injectable()
export class GenresService {
  constructor(@Inject('DB') private readonly db: any) {}

  async createGenre(dto: CreateGenreDto) {
    const [genre] = await this.db.insert(genres).values(dto).returning();
    return genre;
  }

  async updateGenre(id: number, dto: UpdateGenreDto) {
    const [genre] = await this.db.update(genres).set(dto).where(eq(genres.id, id)).returning();
    if (!genre) throw new NotFoundException(`Genre ${id} not found`);
    return genre;
  }

  async deleteGenre(id: number) {
    const [genre] = await this.db.delete(genres).where(eq(genres.id, id)).returning();
    if (!genre) throw new NotFoundException(`Genre ${id} not found`);
    return genre;
  }

  async findAllGenres() {
    return this.db.select().from(genres);
  }

  async addGenreToMovie(movieId: number, genreId: number) {
    const [link] = await this.db.insert(movieGenres).values({ movieId, genreId }).returning();
    return link;
  }

  async removeGenreFromMovie(movieId: number, genreId: number) {
    const [deleted] = await this.db
      .delete(movieGenres)
      .where(and(eq(movieGenres.movieId, movieId), eq(movieGenres.genreId, genreId)))
      .returning();
    if (!deleted) throw new NotFoundException(`Genre ${genreId} not linked to movie ${movieId}`);
    return deleted;
  }
}