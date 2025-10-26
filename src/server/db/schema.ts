import { pgTable, uuid, text, varchar, boolean, pgEnum, integer, timestamp, smallint, check } from 'drizzle-orm/pg-core'
import { timestampColumns } from './columns.helpers'
import { sql } from 'drizzle-orm'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'

export const priorityEnum = pgEnum('priority', ['low', 'medium', 'high'])

export const UserTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: varchar('name', { length: 256 }).notNull(),
  ssoType: varchar('sso_type', { length: 256 }).notNull().default('google'),
  ssoId: varchar('sso_id', { length: 256 }).notNull().unique(),
  ...timestampColumns,
})

export type User = InferSelectModel<typeof UserTable>
export type NewUser = InferInsertModel<typeof UserTable>

export const SessionTable = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => UserTable.id, { onDelete: 'cascade' }),
  sessionToken: text('session_token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ...timestampColumns,
})

export type Session = InferSelectModel<typeof SessionTable>
export type NewSession = InferInsertModel<typeof SessionTable>

export const TaskTable = pgTable(
  'tasks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => UserTable.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 512 }),
    description: text('description').notNull(),
    notes: text('notes'),
    isDone: boolean('is_done').notNull().default(false),
    isBlocked: boolean('is_blocked').notNull().default(false),
    blockedReason: text('blocked_reason'),
    priority: smallint('priority').notNull().default(2), // 1: low, 2: medium, 3: high
    effort: smallint('effort').notNull().default(1),
    dueDate: timestamp('due_date'),
    ...timestampColumns,
  },
  (table) => [
    check('priority_check1', sql`${table.priority} >= 1 AND ${table.priority} <= 3`),
    check('effort_check1', sql`${table.effort} >= 1 AND ${table.effort} <= 5`),
  ],
)

export type Task = InferSelectModel<typeof TaskTable>
export type NewTask = InferInsertModel<typeof TaskTable>
