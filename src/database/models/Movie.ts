import { pgSchema, serial, varchar, text, integer } from "drizzle-orm/pg-core";

const schema = pgSchema("Movie");

export const movies = schema.table("movies", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 100 }).notNull(),
  releaseYear: integer("release_year").notNull(),
  description: text("description"),
  originalLanguage: varchar("original_language", { length: 100 }).notNull(),
  productionCountry: varchar("production_country", { length: 100 }).notNull(),
  ageRating: integer("age_rating").notNull(),
  duration: integer("duration").notNull(),
  subscriptionLevel: varchar("subscription_level", { length: 20 }).notNull(),
  videoUrl480: varchar("video_url_480", { length: 500 }),
  videoUrl720: varchar("video_url_720", { length: 500 }),
  videoUrl1080: varchar("video_url_1080", { length: 500 }),
  posterUrl: varchar("poster_url"),
});

export type Movie = typeof movies.$inferSelect;
export type NewMovie = typeof movies.$inferInsert;
