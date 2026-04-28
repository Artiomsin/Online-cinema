import { pgSchema, serial, varchar, text } from 'drizzle-orm/pg-core';

const schema = pgSchema('Role');

export const roles = schema.table('roles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: text('description'),
});

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
