import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { v4 as uuid } from "uuid";

// import { categorizeItem } from "./src/app/actions/example.js";
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const items = [
  {
    id: uuid(),
    name: "Beans",
    dateAdded: Date.now(),
    dateCompleted: null,
    category: "Canned Goods",
    quantity: 2,
    details: "No salt added!",
  },
];
app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("A user connected");
    socket.on("hello", () => {
      socket.emit("items:retrieved", items);
    });
    socket.on("item:complete", (itemId) => {
      io.emit("item:completed", itemId);
    });
    socket.on("item:uncomplete", (itemId) => {
      io.emit("item:uncompleted", itemId);
    });
    socket.on("item:delete", (itemId) => {
      io.emit("item:deleted", itemId);
    });
    socket.on("item:update", (item) => {
      io.emit("item:updated", item);
    });
    socket.on("item:add", async (item) => {
      const finalItem = {
        ...item,
        category: item.category || "Other",
        id: uuid(),
        dateAdded: Date.now(),
      };
      io.emit("item:added", finalItem);
      import("./src/app/actions/example.js").then(
        async ({ categorizeItem }) => {
          categorizeItem(finalItem.name).then((category) => {
            io.emit("item:updated", {
              ...finalItem,
              category,
            });
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
