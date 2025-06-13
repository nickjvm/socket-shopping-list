import { relations } from "drizzle-orm/relations";
import { lists, items } from "./schema";

export const itemsRelations = relations(items, ({one}) => ({
	list: one(lists, {
		fields: [items.listId],
		references: [lists.id]
	}),
}));

export const listsRelations = relations(lists, ({many}) => ({
	items: many(items),
}));