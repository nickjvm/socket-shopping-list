// app/providers.tsx
"use client";

import { ThemeProvider } from "next-themes";
import React, { createContext, useContext, useEffect, useState } from "react";
import { categorizeItem } from "./actions/example";
import { openDB } from "idb";

import { socket } from "@/socket";
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ShoppingListProvider>{children}</ShoppingListProvider>
    </ThemeProvider>
  );
}

type ShoppingListContextType = {
  items: Item[];
  connectToList: (listId: string) => void;
  addItem: (item: PartialWithRequired<Item, "name">) => void;
  toggleItem: (id: string) => void;
  updateItem: (item: Item) => void;
  removeItem: (id: string) => void;
  completeItem: (id: string) => void;
  uncompleteItem: (id: string) => void;
  setShowCompleted: (showCompleted: boolean) => void;
  showCompleted: boolean;
};

const ShoppingListContext = createContext<ShoppingListContextType | undefined>(
  undefined
);

export const ShoppingListProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [items, setItems] = useState<Item[]>([]);
  const [showCompleted, setShowCompleted] = useState<boolean>(false);

  const renderedItems = showCompleted
    ? items
    : items.filter((item) => !item.dateCompleted);

  function connectToList(listId: string) {
    socket.emit("list:connect", listId);
  }

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      socket.emit("hello");
      socket.on("items:retrieved", setItems);
      socket.on("item:added", (item: Item) => {
        setItems((prev) => [...prev, item]);
      });

      socket.on("item:completed", (itemId: string) => {
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, dateCompleted: Date.now() } : item
          )
        );
      });
      socket.on("item:uncompleted", (itemId: string) => {
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, dateCompleted: null } : item
          )
        );
      });
      socket.on("item:deleted", (itemId: string) => {
        setItems((prev) => prev.filter((item) => item.id !== itemId));
      });

      socket.on("item:updated", (item: Item) => {
        setItems((prev) =>
          prev.map((prevItem) =>
            prevItem.id === item.id ? { ...prevItem, ...item } : prevItem
          )
        );
      });
    }

    function onDisconnect() {
      console.log("Disconnected from socket");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  useEffect(() => {
    // if (!items.length) {
    //   getDB().then((db) => {
    //     const tx = db.transaction("items", "readonly");
    //     const store = tx.objectStore("items");
    //     const index = store.index("dateAdded");
    //     index.getAll().then((storedItems: Item[]) => {
    //       if (storedItems) {
    //         setItems(storedItems);
    //       }
    //     });
    //   });
    //   // getDB().then((db) => {
    //   //   db.getAll("items").then((storedItems: Item[]) => {
    //   //     setItems(storedItems);
    //   //   });
    //   // });
    // } else {
    //   // console.log("updating items in DB", items);
    //   getDB().then((db) => {
    //     db.clear("items").then(() => {
    //       console.log(items);
    //       items.forEach((item) => db.put("items", item));
    //     });
    //   });
    // }
  }, [items]);

  // async function categorize(item: Item) {
  //   if (item.category) {
  //     return;
  //   }

  //   const category = (await categorizeItem(item.name)) || "Other";

  //   setItems((prev) =>
  //     prev.map((prevItem) =>
  //       prevItem.id === item.id ? { ...item, category } : prevItem
  //     )
  //   );
  //   const db = await getDB();
  //   await db.put("items", { ...item, category });
  // }

  // Helper to get the DB instance
  // const getDB = async () => {
  //   return openDB("shopping-list-db", 1, {
  //     upgrade(db) {
  //       if (!db.objectStoreNames.contains("items")) {
  //         const store = db.createObjectStore("items", { keyPath: "id" });
  //         store.createIndex("dateAdded", "dateAdded"); // Create index on dateAdded
  //       }
  //     },
  //   });
  // };

  const addItem = async ({
    name,
    category,
    quantity,
    details,
  }: PartialWithRequired<Item, "name">) => {
    const newItem: Item = {
      name,
      category,
      quantity: quantity || 1,
      details: details || "",
    };
    socket.emit("item:add", newItem);
    // setItems((prev) => [...prev, newItem]);
    // const db = await getDB();
    // await db.put("items", newItem);

    // categorize(newItem);
  };

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, dateCompleted: item.dateCompleted ? null : Date.now() }
          : item
      )
    );
  };

  const updateItem = (item: Item) => {
    socket.emit("item:update", item);
  };

  const completeItem = (id: string) => {
    socket.emit("item:complete", id);
  };

  const uncompleteItem = (id: string) => {
    socket.emit("item:uncomplete", id);
  };

  const removeItem = (id: string) => {
    socket.emit("item.delete", id);
  };

  return (
    <ShoppingListContext.Provider
      value={{
        items: renderedItems,
        connectToList,
        addItem,
        toggleItem,
        removeItem,
        completeItem,
        uncompleteItem,
        updateItem,
        setShowCompleted,
        showCompleted,
      }}
    >
      {children}
    </ShoppingListContext.Provider>
  );
};

export const useShoppingList = () => {
  const context = useContext(ShoppingListContext);
  if (!context) {
    throw new Error(
      "useShoppingList must be used within a ShoppingListProvider"
    );
  }
  return context;
};
