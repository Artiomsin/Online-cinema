import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { movies, movieGenres, genres, movieActors, actors } from '../database/schema';
import { eq, ilike, inArray, sql } from 'drizzle-orm';
import { CreateMovieDto } from '../dto/create-movie.dto';
import { UpdateMovieDto } from '../dto/update-movie.dto';

@Injectable()
export class MoviesService {
  constructor(@Inject('DB') private readonly db: any) {}

  async createMovie(dto: CreateMovieDto) {
    const result = await this.db.execute(sql`
      INSERT INTO "Movie"."movies"
        (title, release_year, description, original_language, production_country,
         age_rating, duration, subscription_level,
         video_url_480, video_url_720, video_url_1080, poster_url)
      VALUES (
        ${dto.title},
        ${dto.releaseYear},
        ${dto.description},
        ${dto.originalLanguage},
        ${dto.productionCountry},
        ${dto.ageRating},
        ${dto.duration},
        ${dto.subscriptionLevel},
        ${dto.videoUrl480 || null},
        ${dto.videoUrl720 || null},
        ${dto.videoUrl1080 || null},
        ${dto.posterUrl || null}
      )
      RETURNING *;
    `);
    return result.rows[0];
  }

  async updateMovie(id: number, dto: UpdateMovieDto) {
    const result = await this.db.execute(sql`
      UPDATE "Movie"."movies"
      SET 
        title = COALESCE(${dto.title}, title),
        release_year = COALESCE(${dto.releaseYear}, release_year),
        description = COALESCE(${dto.description}, description),
        original_language = COALESCE(${dto.originalLanguage}, original_language),
        production_country = COALESCE(${dto.productionCountry}, production_country),
        age_rating = COALESCE(${dto.ageRating}, age_rating),
        duration = COALESCE(${dto.duration}, duration),
        subscription_level = COALESCE(${dto.subscriptionLevel}, subscription_level),
        video_url_480 = COALESCE(${dto.videoUrl480 || null}, video_url_480),
        video_url_720 = COALESCE(${dto.videoUrl720 || null}, video_url_720),
        video_url_1080 = COALESCE(${dto.videoUrl1080 || null}, video_url_1080),
        poster_url = COALESCE(${dto.posterUrl || null}, poster_url)
      WHERE id = ${id}
      RETURNING *;
    `);

    if (result.rows.length === 0) throw new NotFoundException(`Movie ${id} not found`);
    return result.rows[0];
  }

   async deleteMovie(id: number) {
    const result = await this.db.execute(sql`
      DELETE FROM "Movie"."movies"
      WHERE id = ${id}
      RETURNING *;
    `);

    if (result.rows.length === 0) throw new NotFoundException(`Movie ${id} not found`);
    return result.rows[0];
  }

  async findMovieById(id: number) {
  const result = await this.db.execute(sql`
    SELECT 
      id,
      title,
      release_year AS "releaseYear",
      description,
      original_language AS "originalLanguage",
      production_country AS "productionCountry",
      age_rating AS "ageRating",
      duration,
      subscription_level AS "subscriptionLevel",
      video_url_480 AS "videoUrl480",
      video_url_720 AS "videoUrl720",
      video_url_1080 AS "videoUrl1080",
      poster_url AS "posterUrl"
    FROM "Movie"."movies"
    WHERE id = ${id};
  `);

  if (result.rows.length === 0) {
    throw new NotFoundException(`Movie ${id} not found`);
  }

  return result.rows[0];
}



  async findAllMovies() {
  const result = await this.db.execute(sql`
    SELECT 
      id,
      title,
      release_year AS "releaseYear",
      description,
      original_language AS "originalLanguage",
      production_country AS "productionCountry",
      age_rating AS "ageRating",
      duration,
      subscription_level AS "subscriptionLevel",
      video_url_480 AS "videoUrl480",
      video_url_720 AS "videoUrl720",
      video_url_1080 AS "videoUrl1080",
      poster_url AS "posterUrl"
    FROM "Movie"."movies";
  `);
  return result.rows;
}


  // --- Поиск по названию ---
async searchMoviesByTitle(title: string) {
  const result = await this.db.execute(sql`
    SELECT 
      id,
      title,
      release_year AS "releaseYear",
      description,
      original_language AS "originalLanguage",
      production_country AS "productionCountry",
      age_rating AS "ageRating",
      duration,
      subscription_level AS "subscriptionLevel",
      video_url_480 AS "videoUrl480",
      video_url_720 AS "videoUrl720",
      video_url_1080 AS "videoUrl1080",
      poster_url AS "posterUrl"
    FROM "Movie"."movies"
    WHERE title ILIKE ${'%' + title + '%'};
  `);
  return result.rows;
}

// --- Фильтрация по жанру ---
async filterMoviesByGenre(genreId: number) {
  const result = await this.db.execute(sql`
    SELECT 
      m.id,
      m.title,
      m.release_year AS "releaseYear",
      m.description,
      m.original_language AS "originalLanguage",
      m.production_country AS "productionCountry",
      m.age_rating AS "ageRating",
      m.duration,
      m.subscription_level AS "subscriptionLevel",
      m.video_url_480 AS "videoUrl480",
      m.video_url_720 AS "videoUrl720",
      m.video_url_1080 AS "videoUrl1080",
      m.poster_url AS "posterUrl"
    FROM "Movie_Genre"."movie_genres" mg
    INNER JOIN "Movie"."movies" m ON mg.movie_id = m.id
    WHERE mg.genre_id = ${genreId};
  `);
  return result.rows;
}

// --- Фильтрация по языку и стране ---
async filterMoviesByRegion(language?: string, country?: string) {
  let query = sql`
    SELECT 
      id,
      title,
      release_year AS "releaseYear",
      description,
      original_language AS "originalLanguage",
      production_country AS "productionCountry",
      age_rating AS "ageRating",
      duration,
      subscription_level AS "subscriptionLevel",
      video_url_480 AS "videoUrl480",
      video_url_720 AS "videoUrl720",
      video_url_1080 AS "videoUrl1080",
      poster_url AS "posterUrl"
    FROM "Movie"."movies"
    WHERE TRUE
  `;
  if (language) query = sql`${query} AND original_language = ${language}`;
  if (country) query = sql`${query} AND production_country = ${country}`;

  const result = await this.db.execute(query);
  return result.rows;
}

// --- Жанры для фильма ---
async getGenresForMovie(movieId: number) {
  const result = await this.db.execute(sql`
    SELECT g.*
    FROM "Movie_Genre"."movie_genres" mg
    INNER JOIN "Genre"."genres" g ON mg.genre_id = g.id
    WHERE mg.movie_id = ${movieId};
  `);
  return result.rows;
}

// --- Актёры для фильма ---
async getActorsForMovie(movieId: number) {
  const result = await this.db.execute(sql`
    SELECT 
      a.id,
      a.first_name AS "firstName",
      a.last_name AS "lastName",
      ma.character_name AS "characterName"
    FROM "Movie_Actor"."movie_actors" ma
    INNER JOIN "Actor"."actors" a ON ma.actor_id = a.id
    WHERE ma.movie_id = ${movieId};
  `);
  return result.rows;
}

// --- Фильтрация по году ---
async filterMoviesByYear(year: number) {
  if (year < 1888 || year > new Date().getFullYear()) {
    throw new BadRequestException('Некорректный год выпуска');
  }

  const result = await this.db.execute(sql`
    SELECT 
      id,
      title,
      release_year AS "releaseYear",
      description,
      original_language AS "originalLanguage",
      production_country AS "productionCountry",
      age_rating AS "ageRating",
      duration,
      subscription_level AS "subscriptionLevel",
      video_url_480 AS "videoUrl480",
      video_url_720 AS "videoUrl720",
      video_url_1080 AS "videoUrl1080",
      poster_url AS "posterUrl"
    FROM "Movie"."movies"
    WHERE release_year = ${year};
  `);

  return result.rows;
}


}