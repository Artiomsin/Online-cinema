import { pgSchema, serial, integer } from 'drizzle-orm/pg-core';
import { users } from './User';
import { roles } from './Role';

const schema = pgSchema('User_Role');

export const userRoles = schema.table('user_roles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  roleId: integer('role_id')
    .notNull()
    .references(() => roles.id, { onDelete: 'cascade' }),
});

export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;
