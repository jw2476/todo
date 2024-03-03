import { relations } from "drizzle-orm";
import { date, integer, pgTable, serial, text, time, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    username: text('username').notNull(),
    password: text('password').notNull(),
    start: time('start').notNull(),
    end: time('end').notNull()
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const usersRelations = relations(users, ({ many }) => ({
    tasks: many(tasks)
}));

export const tasks = pgTable('tasks', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    duration: integer('duration').notNull(),
    deadline: timestamp('deadline', { withTimezone: true }).notNull(),
    user_id: integer('user_id').references(() => users.id)
});

export const tasksRelations = relations(tasks, ({ one }) => ({
    owner: one(users, {
        fields: [tasks.user_id],
        references: [users.id]
    })
}));