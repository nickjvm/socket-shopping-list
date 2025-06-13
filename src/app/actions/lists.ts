"use server";

import { v4 as uuid } from "uuid";
import { createClient } from "@libsql/client";
import { redirect } from "next/navigation";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function fetchListItems(listId: string) {
  const result = await client.execute({
    sql: "SELECT * FROM items WHERE list_id = ?",
    args: [listId],
  });

  return JSON.parse(JSON.stringify(result.rows)) as Item[];
}

export async function createList(formData: FormData) {
  const id = uuid();
  await client.execute({
    sql: "INSERT INTO lists (id, name) VALUES (?, ?)",
    args: [id, formData.get("name") as string],
  });

  redirect(`/list/${id}`);
}

export async function fetchList(listId: string) {
  const result = await client.execute({
    sql: `
            SELECT lists.id, lists.name, 
                json_group_array(
                    json_object(
                        'id', items.id,
                        'name', items.name,
                        'quantity', items.quantity,
                        'details', items.details,
                        'dateAdded', items.dateAdded,
                        'dateCompleted', items.dateCompleted
                    )
                ) as items
            FROM lists
            LEFT JOIN items ON items.list_id = lists.id
            WHERE lists.id = ?
            GROUP BY lists.id, lists.name
    `,
    args: [listId],
  });

  console.log(result);
  return {
    id: result.rows[0].id as string,
    name: result.rows[0].name as string,
    items: JSON.parse((result.rows[0].items as string) || "[]") as Item[],
  };
}

export async function fetchLists(listIds: string[]) {
  if (listIds.length === 0) return [];

  const placeholders = listIds.map(() => "?").join(",");
  const result = await client.execute({
    sql: `
            SELECT lists.id, lists.name
            FROM lists
            WHERE lists.id IN (${placeholders})
    `,
    args: listIds,
  });

  return JSON.parse(JSON.stringify(result.rows)) as {
    id: string;
    name: string;
  }[];
}
