import {
  sqliteTable,
  AnySQLiteColumn,
  foreignKey,
  text,
  integer,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const items = sqliteTable("items", {
  id: text().primaryKey().notNull(),
  listId: text("list_id")
    .notNull()
    .references(() => lists.id, { onDelete: "cascade" }),
  name: text().notNull(),
  category: text().default("Other").notNull(),
  quantity: integer().default(1).notNull(),
  details: text().default("sql`(NULL)`"),
  completedAt: integer().default(sql`(NULL)`),
  createdAt: integer()
    .default(sql`(strftime('%s','now'))`)
    .notNull(),
  index: integer().default(999999999).notNull(),
});

export const lists = sqliteTable("lists", {
  id: text().primaryKey().notNull(),
  name: text().notNull(),
  createdAt: integer()
    .default(sql`(strftime('%s','now'))`)
    .notNull(),
});
