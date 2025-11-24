import { pgSchema, serial, integer, text, date } from "drizzle-orm/pg-core";
import { users } from "./User";
import { movies } from "./Movie";

const schema = pgSchema("Comment");

export const comments = schema.table("comments", {
  id: serial("id").primaryKey(),
  movieId: integer("movie_id").notNull().references(() => movies.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  commentText: text("comment_text"),
  commentDate: date("comment_date").notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
