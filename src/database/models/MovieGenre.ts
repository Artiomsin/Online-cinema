import { pgSchema, serial, integer } from "drizzle-orm/pg-core";
import { movies } from "./Movie";
import { genres } from "./Genre";

const schema = pgSchema("Movie_Genre");

export const movieGenres = schema.table("movie_genres", {
  id: serial("id").primaryKey(),
  movieId: integer("movie_id").notNull().references(() => movies.id, { onDelete: "cascade" }),
  genreId: integer("genre_id").notNull().references(() => genres.id, { onDelete: "cascade" }),
});

export type MovieGenre = typeof movieGenres.$inferSelect;
export type NewMovieGenre = typeof movieGenres.$inferInsert;
