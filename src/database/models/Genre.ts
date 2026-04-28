import { pgSchema, serial, varchar, text } from 'drizzle-orm/pg-core';

const schema = pgSchema('Genre');

export const genres = schema.table('genres', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: text('description'),
});

export type Genre = typeof genres.$inferSelect;
export type NewGenre = typeof genres.$inferInsert;
