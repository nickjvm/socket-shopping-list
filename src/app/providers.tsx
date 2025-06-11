// app/providers.tsx
"use client";

import { ThemeProvider } from "next-themes";
import React, { createContext, useContext, useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { categorizeItem } from "./actions/example";
import { openDB } from "idb";
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ShoppingListProvider>{children}</ShoppingListProvider>
    </ThemeProvider>
  );
}

type ShoppingListContextType = {
  items: Item[];
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
  useEffect(() => {
    if (!items.length) {
      getDB().then((db) => {
        const tx = db.transaction("items", "readonly");
        const store = tx.objectStore("items");
        const index = store.index("dateAdded");
        index.getAll().then((storedItems: Item[]) => {
          if (storedItems) {
            setItems(storedItems);
          }
        });
      });
      // getDB().then((db) => {
      //   db.getAll("items").then((storedItems: Item[]) => {
      //     setItems(storedItems);
      //   });
      // });
    } else {
      // console.log("updating items in DB", items);
      getDB().then((db) => {
        db.clear("items").then(() => {
          items.forEach((item) => db.put("items", item));
        });
      });
    }
  }, [items]);

  async function categorize(item: Item) {
    if (item.category) {
      return;
    }

    const category = (await categorizeItem(item.name)) || "Other";

    setItems((prev) =>
      prev.map((prevItem) =>
        prevItem.id === item.id ? { ...item, category } : prevItem
      )
    );
    const db = await getDB();
    await db.put("items", { ...item, category });
  }

  // Helper to get the DB instance
  const getDB = async () => {
    return openDB("shopping-list-db", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("items")) {
          const store = db.createObjectStore("items", { keyPath: "id" });
          store.createIndex("dateAdded", "dateAdded"); // Create index on dateAdded
        }
      },
    });
  };

  const addItem = async ({
    name,
    category,
    quantity,
    details,
  }: PartialWithRequired<Item, "name">) => {
    const newItem: Item = {
      id: uuid(),
      name,
      category,
      quantity: quantity || 1,
      details: details || "",
      dateAdded: Date.now(),
      dateCompleted: null,
    };
    setItems((prev) => [...prev, newItem]);
    // const db = await getDB();
    // await db.put("items", newItem);

    categorize(newItem);
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
    setItems((prev) =>
      prev.map((prevItem) =>
        prevItem.id === item.id
          ? {
              ...prevItem,
              ...item,
              id: prevItem.id,
              dateAdded: prevItem.dateAdded,
              dateCompleted: null,
            }
          : prevItem
      )
    );
  };

  const completeItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, dateCompleted: Date.now() } : item
      )
    );
  };

  const uncompleteItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, dateCompleted: null } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <ShoppingListContext.Provider
      value={{
        items: renderedItems,
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
