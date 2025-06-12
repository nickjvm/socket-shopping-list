import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { v4 as uuid } from "uuid";
import { createClient } from "@libsql/client";

// import { categorizeItem } from "./src/app/actions/example.js";
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const turso = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("A user connected");
    let room: string;
    socket.on("list:connect", async (id) => {
      room = id;
      socket.join(id);
      const { rows } = await turso.execute(
        "SELECT * FROM items WHERE list_id = ?",
        [id]
      );

      socket.emit("items:retrieved", rows);
    });
    socket.on("item:complete", async (itemId) => {
      await turso.execute("UPDATE items SET dateCompleted = ? WHERE id = ?", [
        Date.now(),
        itemId,
      ]);
      io.to(room).emit("item:completed", itemId);
    });
    socket.on("item:uncomplete", async (itemId) => {
      await turso.execute(
        "UPDATE items SET dateCompleted = NULL WHERE id = ?",
        [itemId]
      );
      io.to(room).emit("item:uncompleted", itemId);
    });
    socket.on("item:delete", (itemId) => {
      io.to(room).emit("item:deleted", itemId);
    });
    socket.on("item:update", (item) => {
      io.to(room).emit("item:updated", item);
    });
    socket.on("item:add", async ({ name, category, quantity, details }) => {
      const { rows } = await turso.execute(
        "INSERT INTO items (id, name, category, dateAdded, quantity, details, list_id) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *",
        [
          uuid(),
          name,
          category || "Other",
          Date.now(),
          quantity || 1,
          details,
          room,
        ]
      );
      console.log(rows);
      io.to(room).emit("item:added", rows[0]);
      import("./src/app/actions/example.js").then(
        async ({ categorizeItem }) => {
          const category = await categorizeItem(name);
          turso.execute("UPDATE items SET category = ? WHERE id = ?", [
            category || "Other",
            rows[0].id,
          ]);
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
