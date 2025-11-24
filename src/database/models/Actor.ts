import { pgSchema, serial, varchar, date, text } from "drizzle-orm/pg-core";

const schema = pgSchema("Actor");

export const actors = schema.table("actors", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 50 }).notNull(),
  lastName: varchar("last_name", { length: 50 }).notNull(),
  birthDate: date("birth_date").notNull(),
  biography: text("biography"),
});

export type Actor = typeof actors.$inferSelect;
export type NewActor = typeof actors.$inferInsert;
