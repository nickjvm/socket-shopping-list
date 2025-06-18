import {
  sqliteTable,
  AnySQLiteColumn,
  text,
  numeric,
  foreignKey,
  integer,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const lists = sqliteTable("lists", {
  id: text().primaryKey(),
  name: text().notNull(),
  createdAt: numeric()
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const items = sqliteTable("items", {
  id: text().primaryKey().notNull(),
  listId: text("list_id")
    .notNull()
    .references(() => lists.id, { onDelete: "cascade" }),
  name: text().notNull(),
  category: text().default("Other").notNull(),
  quantity: integer().default(1).notNull(),
  details: text().default("sql`(NULL)`"),
  completedAt: numeric().default(sql`(NULL)`),
  createdAt: numeric()
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  index: integer().notNull().default(0),
});
