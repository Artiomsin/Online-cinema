import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { actors, genres, movieActors, movieGenres, movies } from '../database/schema';
import { eq, and, sql } from 'drizzle-orm';
import { CreateActorDto } from '../dto/create-actor.dto';
import { UpdateActorDto } from '../dto/update-actor.dto';

@Injectable()
export class ActorsService {
  constructor(@Inject('DB') private readonly db: any) {}

  async createActor(dto: CreateActorDto) {
    const [actor] = await this.db.insert(actors).values(dto).returning();
    return actor;
  }

  async updateActor(id: number, dto: UpdateActorDto) {
    const [actor] = await this.db.update(actors).set(dto).where(eq(actors.id, id)).returning();
    if (!actor) throw new NotFoundException(`Actor ${id} not found`);
    return actor;
  }

  async deleteActor(id: number) {
    const [actor] = await this.db.delete(actors).where(eq(actors.id, id)).returning();
    if (!actor) throw new NotFoundException(`Actor ${id} not found`);
    return actor;
  }

  async findActorById(id: number) {
    const [actor] = await this.db.select().from(actors).where(eq(actors.id, id));
    if (!actor) throw new NotFoundException(`Actor ${id} not found`);
    return actor;
  }

  async findAllActors() {
    return this.db.select().from(actors);
  }

  async addActorToMovie(movieId: number, actorId: number, characterName: string) {
    const [link] = await this.db
      .insert(movieActors)
      .values({ movieId, actorId, characterName })
      .returning();
    return link;
  }

  async removeActorFromMovie(movieId: number, actorId: number) {
    const [deleted] = await this.db
      .delete(movieActors)
      .where(and(eq(movieActors.movieId, movieId), eq(movieActors.actorId, actorId)))
      .returning();
    if (!deleted) throw new NotFoundException(`Actor ${actorId} not linked to movie ${movieId}`);
    return deleted;
  }
  
async getActorMovies(actorId: number) {
  const result = await this.db.execute(
    sql`
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
      WHERE ma.actor_id = ${actorId}
    `
  );

  const rows = result.rows;

  const grouped = new Map<number, {
    id: number;
    title: string;
    releaseYear: number;
    characterName: string;
    genres: string[];
  }>();

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
  
}

}
