import { pgSchema, serial, integer, varchar } from "drizzle-orm/pg-core";
import { movies } from "./Movie";
import { actors } from "./Actor";

const schema = pgSchema("Movie_Actor");

export const movieActors = schema.table("movie_actors", {
  id: serial("id").primaryKey(),
  movieId: integer("movie_id").notNull().references(() => movies.id, { onDelete: "cascade" }),
  actorId: integer("actor_id").notNull().references(() => actors.id, { onDelete: "cascade" }),
  characterName: varchar("character_name", { length: 100 }).notNull(),
});

export type MovieActor = typeof movieActors.$inferSelect;
export type NewMovieActor = typeof movieActors.$inferInsert;
