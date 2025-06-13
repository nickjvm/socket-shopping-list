import { sqliteTable, AnySQLiteColumn, text, integer } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const items = sqliteTable("items", {
	id: text().primaryKey().notNull(),
	name: text(),
	dateAdded: integer().notNull(),
	dateCompleted: integer().default(sql`(null)`),
	category: text().default("Other").notNull(),
	quantity: integer().default(1).notNull(),
	details: text(),
	listId: text("list_id").notNull(),
});

export const lists = sqliteTable("lists", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
});

