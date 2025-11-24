import { pgSchema, serial, varchar, numeric, integer } from "drizzle-orm/pg-core";

const schema = pgSchema("Subscription");

export const subscriptions = schema.table("subscriptions", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 50 }).notNull().unique(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  period: integer("period").notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
