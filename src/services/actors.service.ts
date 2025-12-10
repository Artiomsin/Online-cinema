import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { CreateActorDto } from '../dto/create-actor.dto';
import { UpdateActorDto } from '../dto/update-actor.dto';

@Injectable()
export class ActorsService {
  constructor(@Inject('DB') private readonly db: any) {}

  // --- CREATE ---
  async createActor(dto: CreateActorDto) {
    const result = await this.db.execute(sql`
      INSERT INTO "Actor"."actors" (first_name, last_name, birth_date, biography)
      VALUES (${dto.firstName}, ${dto.lastName}, ${dto.birthDate}, ${dto.biography})
      RETURNING id, first_name AS "firstName", last_name AS "lastName", birth_date AS "birthDate", biography;
    `);
    return result.rows[0];
  }

  // --- UPDATE ---
  async updateActor(id: number, dto: UpdateActorDto) {
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

    if (result.rows.length === 0) throw new NotFoundException(`Actor ${id} not found`);
    return result.rows[0];
  }

  // --- DELETE ---
  async deleteActor(id: number) {
    const result = await this.db.execute(sql`
      DELETE FROM "Actor"."actors"
      WHERE id = ${id}
      RETURNING id, first_name AS "firstName", last_name AS "lastName", birth_date AS "birthDate", biography;
    `);

    if (result.rows.length === 0) throw new NotFoundException(`Actor ${id} not found`);
    return result.rows[0];
  }

  // --- FIND BY ID ---
  async findActorById(id: number) {
    const result = await this.db.execute(sql`
      SELECT id, first_name AS "firstName", last_name AS "lastName", birth_date AS "birthDate", biography
      FROM "Actor"."actors"
      WHERE id = ${id};
    `);

    if (result.rows.length === 0) throw new NotFoundException(`Actor ${id} not found`);
    return result.rows[0];
  }

  // --- FIND ALL ---
  async findAllActors() {
    const result = await this.db.execute(sql`
      SELECT id, first_name AS "firstName", last_name AS "lastName", birth_date AS "birthDate", biography
      FROM "Actor"."actors";
    `);
    return result.rows;
  }

  // --- ADD ACTOR TO MOVIE ---
  async addActorToMovie(movieId: number, actorId: number, characterName: string) {
    const result = await this.db.execute(sql`
      INSERT INTO "Movie_Actor"."movie_actors" (movie_id, actor_id, character_name)
      VALUES (${movieId}, ${actorId}, ${characterName})
      RETURNING id, movie_id AS "movieId", actor_id AS "actorId", character_name AS "characterName";
    `);
    return result.rows[0];
  }

  // --- REMOVE ACTOR FROM MOVIE ---
  async removeActorFromMovie(movieId: number, actorId: number) {
    const result = await this.db.execute(sql`
      DELETE FROM "Movie_Actor"."movie_actors"
      WHERE movie_id = ${movieId} AND actor_id = ${actorId}
      RETURNING id, movie_id AS "movieId", actor_id AS "actorId", character_name AS "characterName";
    `);

    if (result.rows.length === 0) throw new NotFoundException(`Actor ${actorId} not linked to movie ${movieId}`);
    return result.rows[0];
  }

  // --- GET ACTOR MOVIES ---
  async getActorMovies(actorId: number) {
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
