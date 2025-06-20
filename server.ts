import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { v4 as uuid } from "uuid";
import { and, eq, inArray, sql, SQL } from "drizzle-orm";

import db from "./src/db/index.js";
import { items } from "./drizzle/schema.js";

const dev = process.env.NODE_ENV !== "production";
const hostname = dev ? "localhost" : "0.0.0.0";

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port, turbo: true });
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
      const rows = await db
        .select()
        .from(items)
        .where(eq(items.listId, id))
        .orderBy(items.index);
      socket.emit("list:connected", id);
      socket.emit("items:retrieved", rows);
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

        const nextItems = await db
          .update(items)
          .set({ index: indexSql, category: categorySql })
          .where(inArray(items.id, ids))
          .returning();

        io.to(room).emit(
          "items:retrieved",
          nextItems.sort((a, b) => a.index - b.index)
        );
      }
    );
    socket.on("item:complete", async (itemId) => {
      await db
        .update(items)
        .set({ completedAt: Date.now() })
        .where(eq(items.id, itemId));

      io.to(room).emit("item:completed", itemId);
    });

    socket.on("list:rename", async ({ id, name }) => {
      socket.to(room).emit("list:renamed", { id, name });
    });

    socket.on("item:uncomplete", async (itemId) => {
      await db
        .update(items)
        .set({ completedAt: null })
        .where(eq(items.id, itemId));

      io.to(room).emit("item:uncompleted", itemId);
    });

    socket.on("item:delete", async (itemId) => {
      await db.delete(items).where(eq(items.id, itemId));
      io.to(room).emit("item:deleted", itemId);
    });

    socket.on("item:update", async (item) => {
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
    });

    socket.on("items:delete", async ({ listId, itemIds }) => {
      if (!listId || !itemIds || itemIds.length === 0) {
        return;
      }

      await db
        .delete(items)
        .where(and(inArray(items.id, itemIds), eq(items.listId, listId)));

      io.to(room).emit("items:deleted", itemIds);
    });

    socket.on("item:add", async ({ name, category, quantity, details }) => {
      if (!name || name.trim() === "") {
        socket.emit("item:error", "Item name is required");
        return;
      }

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
      import("./src/app/actions/example.js").then(
        async ({ categorizeItem }) => {
          const category = await categorizeItem(name);

          if (category === "Other") {
            return;
          }

          await db
            .update(items)
            .set({ category: category || "Other" })
            .where(eq(items.id, rows[0].id));

          io.emit("item:updated", {
            ...rows[0],
            category,
          });
          socket.emit("item:categorized", {
            id: rows[0].id,
            category,
          });
        }
      );
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
