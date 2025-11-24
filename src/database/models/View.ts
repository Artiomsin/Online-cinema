import { pgSchema, serial, integer, date } from "drizzle-orm/pg-core";
import { users } from "./User";
import { movies } from "./Movie";

const schema = pgSchema("View");

export const views = schema.table("views", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  movieId: integer("movie_id").notNull().references(() => movies.id, { onDelete: "cascade" }),
  viewDate: date("view_date").notNull(),
  stopPosition: integer("stop_position"),
});

export type View = typeof views.$inferSelect;
export type NewView = typeof views.$inferInsert;
