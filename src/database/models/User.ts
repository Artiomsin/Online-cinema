import { pgSchema, serial, varchar, boolean, date } from 'drizzle-orm/pg-core';

const schema = pgSchema('User');

export const users = schema.table('users', {
  id: serial('id').primaryKey(),
  login: varchar('login', { length: 50 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 50 }).notNull(),
  lastName: varchar('last_name', { length: 50 }).notNull(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  registrationDate: date('registration_date').notNull(),
  status: boolean('status').notNull().default(true),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
