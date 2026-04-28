import { pgSchema, serial, integer, date } from 'drizzle-orm/pg-core';
import { users } from './User';
import { movies } from './Movie';

const schema = pgSchema('Favorites');

export const favorites = schema.table('favorites', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  movieId: integer('movie_id')
    .notNull()
    .references(() => movies.id, { onDelete: 'cascade' }),
  addedDate: date('added_date').notNull(),
});

export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;
