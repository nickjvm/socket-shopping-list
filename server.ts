import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { v4 as uuid } from "uuid";
import { and, eq, inArray, sql, SQL } from "drizzle-orm";

import db from "./src/db/index.js";
import { items } from "./drizzle/schema.js";
import { categorizeItem } from "./src/app/actions/categorize.js";

const dev = process.env.NODE_ENV !== "production";
const hostname = dev ? "localhost" : "0.0.0.0";

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port, turbo: dev });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    let room: string;
    socket.on("list:disconnect", (id) => {
      console.log("A user disconnected from", id);
      socket.leave(room);
      room = "";
      socket.emit("list:disconnected", id);
    });

    socket.on("list:connect", async (id) => {
      console.log("A user connected to", id);
      room = id;
      socket.join(id);
      try {
        const rows = await db
          .select()
          .from(items)
          .where(eq(items.listId, id))
          .orderBy(items.index);
        socket.emit("list:connected", id);
        socket.emit("items:retrieved", rows);
      } catch (error) {
        console.error("Error retrieving items for list:", id, error);
        socket.emit("list:error", "Unable to retrieve items for this list");
      }
    });

    socket.on(
      "list:sort",
      async (listItems: { id: string; index: number; category: string }[]) => {
        const indexSqlChunks: SQL[] = [];
        const categorySqlChunks: SQL[] = [];
        const ids: string[] = [];

        indexSqlChunks.push(sql`(case`);
        categorySqlChunks.push(sql`(case`);

        for (const item of listItems) {
          indexSqlChunks.push(
            sql`when ${items.id} = ${item.id} then ${item.index}`
          );
          categorySqlChunks.push(
            sql`when ${items.id} = ${item.id} then ${item.category}`
          );
          ids.push(item.id);
        }

        indexSqlChunks.push(sql`end)`);
        categorySqlChunks.push(sql`end)`);

        const indexSql: SQL = sql.join(indexSqlChunks, sql.raw(" "));
        const categorySql: SQL = sql.join(categorySqlChunks, sql.raw(" "));

        try {
          const nextItems = await db
            .update(items)
            .set({ index: indexSql, category: categorySql })
            .where(inArray(items.id, ids))
            .returning();

          io.to(room).emit(
            "items:retrieved",
            nextItems.sort((a, b) => a.index - b.index)
          );
        } catch (error) {
          console.error("Error sorting items:", error);
          socket.emit("list:error", "Unable to sort items");
        }
      }
    );
    socket.on("item:complete", async (itemId) => {
      try {
        // const [maxIndexRow] = await db
        //   .select({ maxIndex: sql`max(${items.index})` })
        //   .from(items)
        //   .where(eq(items.listId, room));
        const item = await db
          .update(items)
          .set({
            completedAt: Date.now(),
            // index: (maxIndexRow.maxIndex as number) + 1,
          })
          .where(eq(items.id, itemId))
          .returning();

        io.to(room).emit("item:completed", item[0]);
      } catch (error) {
        console.error("Error completing item:", error);
        socket.emit("item:error", "Unable to complete item");
      }
    });

    socket.on("list:rename", async ({ id, name }) => {
      socket.to(room).emit("list:renamed", { id, name });
    });

    socket.on("item:uncomplete", async (itemId) => {
      try {
        await db
          .update(items)
          .set({ completedAt: null })
          .where(eq(items.id, itemId));

        io.to(room).emit("item:uncompleted", itemId);
      } catch (e) {
        console.error("Error uncompleting item:", e);
        socket.emit("item:error", "Unable to uncomplete item");
      }
    });

    socket.on("item:delete", async (itemId) => {
      try {
        await db.delete(items).where(eq(items.id, itemId));
        io.to(room).emit("item:deleted", itemId);
      } catch (error) {
        console.error("Error deleting item:", error);
        socket.emit("item:error", "Unable to delete item");
      }
    });

    socket.on("item:update", async (item) => {
      try {
        await db
          .update(items)
          .set({
            name: item.name,
            category: item.category || "Other",
            quantity: item.quantity,
            details: item.details,
          })
          .where(eq(items.id, item.id));
        io.to(room).emit("item:updated", item);
      } catch (error) {
        console.error("Error updating item:", error);
        socket.emit("item:error", "Unable to update item");
      }
    });

    socket.on("items:delete", async ({ listId, itemIds }) => {
      if (!listId || !itemIds || itemIds.length === 0) {
        return;
      }

      try {
        await db
          .delete(items)
          .where(and(inArray(items.id, itemIds), eq(items.listId, listId)));

        io.to(room).emit("items:deleted", itemIds);
      } catch (error) {
        console.error("Error deleting items:", error);
        socket.emit("item:error", "Unable to delete items");
      }
    });

    socket.on("item:add", async ({ name, category, quantity, details }) => {
      if (!name || name.trim() === "") {
        socket.emit("item:error", "Item name is required");
        return;
      }

      try {
        const rows = await db
          .insert(items)
          .values({
            id: uuid(),
            name,
            category: category || "Other",
            createdAt: Date.now(),
            quantity: quantity || 1,
            details,
            listId: room,
            index: 9999999999, // default index, will be updated later
          })
          .returning();

        io.to(room).emit("item:added", rows[0]);
        setTimeout(() => {
          socket.emit("item:highlight", rows[0].id);
        }, 250);

        if (category) {
          return;
        }

        const aiCategory = await categorizeItem(name);

        if (aiCategory === "Other") {
          return;
        }

        await db
          .update(items)
          .set({ category: aiCategory })
          .where(eq(items.id, rows[0].id));

        io.emit("item:updated", {
          ...rows[0],
          category: aiCategory,
        });
        socket.emit("item:categorized", {
          id: rows[0].id,
          category: aiCategory,
        });
      } catch (error) {
        console.error("Error adding item:", error);
        socket.emit("item:error", "Unable to add item");
      }
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
