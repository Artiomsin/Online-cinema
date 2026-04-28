import {
  pgSchema,
  serial,
  integer,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './User';

const schema = pgSchema('ActionLog');

export const actionLogs = schema.table('action_logs', {
  id: serial('id').primaryKey(),

  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  timestamp: timestamp('timestamp', { mode: 'date' }).notNull().defaultNow(),

  action: varchar('action', { length: 100 }).notNull(),
});

export type ActionLog = typeof actionLogs.$inferSelect;
export type NewActionLog = typeof actionLogs.$inferInsert;
