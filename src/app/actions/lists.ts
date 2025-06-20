"use server";

import { v4 as uuid } from "uuid";
import { cookies } from "next/headers";

import db from "@/db";
import { items, lists } from "@/../drizzle/schema";
import { eq, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";

export type Response<T> =
  | {
      status: 200;
      message: string;
      data: T;
    }
  | {
      status: 400;
      message: string;
      errors: Record<string, string>;
    };
export async function createList(formData: FormData): Promise<Response<List>> {
  const name = (formData.get("name") as string)?.trim();
  if (!name) {
    return {
      status: 400,
      message: "List not created",
      errors: {
        name: "List name is required",
      },
    };
  }
  const id = uuid();
  const list = await db
    .insert(lists)
    .values({
      id,
      name: formData.get("name") as string,
    })
    .returning();

  return {
    status: 200,
    message: "List created successfully",
    data: list[0],
  };
}

export async function renameList(
  listId: string,
  name: string
): Promise<Response<List>> {
  if (!name && !name.trim()) {
    throw new Error("List name is required");
  }
  const list = await db
    .update(lists)
    .set({
      name,
    })
    .where(eq(lists.id, listId))
    .returning();

  return {
    status: 200,
    message: "List renamed successfully",
    data: list[0],
  };
}

export async function fetchList(listId: string) {
  const results = await db
    .select({
      lists,
      items,
    })
    .from(lists)
    .leftJoin(items, eq(lists.id, items.listId))
    .where(eq(lists.id, listId));

  if (!results.length) {
    const cookieStore = await cookies();
    const historyCookie = cookieStore.get("history")?.value || "";
    const updatedHistoryCookie = historyCookie
      .split(",")
      .filter((id) => id !== listId);
    cookieStore.set("history", updatedHistoryCookie.join(","));
    notFound();
  }
  // Group items by list
  const grouped = results.reduce<{
    list: typeof lists.$inferSelect | null;
    items: (typeof items.$inferSelect)[];
  }>(
    (acc, row) => {
      if (!acc.list && row.lists) acc.list = row.lists;
      if (row.items) acc.items.push(row.items);
      return acc;
    },
    { list: null, items: [] }
  );

  return {
    id: grouped.list?.id || listId,
    name: grouped.list?.name || "Untitled List",
    items: grouped.items,
  };
}

export async function fetchLists(listIds: string[]) {
  if (listIds.length === 0) return [];

  const result = await db
    .select()
    .from(lists)
    .where(inArray(lists.id, listIds));

  return result;
}
