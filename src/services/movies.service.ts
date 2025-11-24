import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { movies, movieGenres, genres, movieActors, actors } from '../database/schema';
import { eq, ilike, inArray } from 'drizzle-orm';
import { CreateMovieDto } from '../dto/create-movie.dto';
import { UpdateMovieDto } from '../dto/update-movie.dto';

@Injectable()
export class MoviesService {
  constructor(@Inject('DB') private readonly db: any) {}

  async createMovie(dto: CreateMovieDto) {
    const [movie] = await this.db.insert(movies).values(dto).returning();
    return movie;
  }

  async updateMovie(id: number, dto: UpdateMovieDto) {
    const [movie] = await this.db.update(movies).set(dto).where(eq(movies.id, id)).returning();
    if (!movie) throw new NotFoundException(`Movie ${id} not found`);
    return movie;
  }

  async deleteMovie(id: number) {
    const [movie] = await this.db.delete(movies).where(eq(movies.id, id)).returning();
    if (!movie) throw new NotFoundException(`Movie ${id} not found`);
    return movie;
  }

  async findMovieById(id: number) {
    const [movie] = await this.db.select().from(movies).where(eq(movies.id, id));
    if (!movie) throw new NotFoundException(`Movie ${id} not found`);
    return movie;
  }

  async findAllMovies() {
    return this.db.select().from(movies);
  }

  async searchMoviesByTitle(title: string) {
    return this.db.select().from(movies).where(ilike(movies.title, `%${title}%`));
  }

  async filterMoviesByGenre(genreId: number) {
    const rows = await this.db
      .select({ movie: movies })
      .from(movieGenres)
      .innerJoin(movies, eq(movieGenres.movieId, movies.id))
      .where(eq(movieGenres.genreId, genreId));
    return rows.map(r => r.movie);
  }

  async filterMoviesByRegion(language?: string, country?: string) {
    let query = this.db.select().from(movies);
    if (language) query = query.where(eq(movies.originalLanguage, language));
    if (country) query = query.where(eq(movies.productionCountry, country));
    return query;
  }

  async getGenresForMovie(movieId: number) {
  const links = await this.db.select().from(movieGenres).where(eq(movieGenres.movieId, movieId));
  const genreIds = links.map(l => l.genreId);
  return this.db.select().from(genres).where(inArray(genres.id, genreIds));
}

async getActorsForMovie(movieId: number) {
  const links = await this.db.select().from(movieActors).where(eq(movieActors.movieId, movieId));
  const actorIds = links.map(l => l.actorId);
  const actorList = await this.db.select().from(actors).where(inArray(actors.id, actorIds));
  return links.map(link => {
    const actor = actorList.find(a => a.id === link.actorId);
    return {
      id: actor.id,
      firstName: actor.firstName,
      lastName: actor.lastName,
      characterName: link.characterName
    };
  });
}

async filterMoviesByYear(year: number) {
    // базовая валидация диапазона
    if (year < 1888 || year > new Date().getFullYear()) {
      throw new BadRequestException('Некорректный год выпуска');
    }

    // Явно выполняем запрос и возвращаем строки
    const rows = await this.db
      .select()
      .from(movies)
      .where(eq(movies.releaseYear, year));

    return rows;
  }

}