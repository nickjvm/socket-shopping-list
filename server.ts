import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { v4 as uuid } from "uuid";
import { eq } from "drizzle-orm";

import db from "./src/db/index.js";
import { items } from "./drizzle/schema.js";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("A user connected");
    let room: string;
    socket.on("list:connect", async (id) => {
      room = id;
      socket.join(id);
      const rows = await db.select().from(items).where(eq(items.listId, id));
      socket.emit("items:retrieved", rows);
    });

    socket.on("item:complete", async (itemId) => {
      await db
        .update(items)
        .set({ completedAt: Date.now().toString() })
        .where(eq(items.id, itemId));

      io.to(room).emit("item:completed", itemId);
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

    socket.on("item:add", async ({ name, category, quantity, details }) => {
      const rows = await db
        .insert(items)
        .values({
          id: uuid(),
          name,
          category: category || "Other",
          createdAt: Date.now().toString(),
          quantity: quantity || 1,
          details,
          listId: room,
        })
        .returning();

      io.to(room).emit("item:added", rows[0]);

      import("./src/app/actions/example.js").then(
        async ({ categorizeItem }) => {
          const category = await categorizeItem(name);
          await db
            .update(items)
            .set({ category: category || "Other" })
            .where(eq(items.id, rows[0].id));

          io.emit("item:updated", {
            ...rows[0],
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
