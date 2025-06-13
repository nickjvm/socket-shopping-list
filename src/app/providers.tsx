// app/providers.tsx
"use client";

import { ThemeProvider } from "next-themes";
import React, { createContext, useContext, useEffect, useState } from "react";

import { socket } from "@/socket";
import cn from "@/utils/cn";
import { RxHamburgerMenu } from "react-icons/rx";
import Link from "next/link";
import { FiPlusSquare } from "react-icons/fi";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { useListHistory } from "./hooks/useListHistory";
import { IoIosClose } from "react-icons/io";
import { usePathname } from "next/navigation";
import ThemeSwitch from "./components/ThemeSwitch";
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ShoppingListProvider>
        <LayoutProvider>{children}</LayoutProvider>
      </ShoppingListProvider>
    </ThemeProvider>
  );
}

type LayoutContextType = {
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;
};

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);
export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  const [navOpen, setNavOpen] = useState<boolean>(false);
  const { history, remove } = useListHistory();
  const pathname = usePathname();
  const { showCompleted, setShowCompleted } = useShoppingList();
  function toggleNav() {
    setNavOpen((prev) => !prev);
  }

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);
  return (
    <LayoutContext.Provider value={{ navOpen, setNavOpen }}>
      <div id="layout" className="flex h-screen relative overflow-hidden">
        <div className="grow">{children}</div>
        <div
          className={cn(
            "max-w-[calc(100vw-60px)] w-3xs bg-slate-100 dark:bg-slate-800 border-l border-l-slate-300 dark:border-l-slate-700 absolute top-0 right-0 bottom-0 translate-x-full transition-transform duration-300 z-20",
            navOpen && "translate-x-0"
          )}
        >
          <button
            onClick={toggleNav}
            className="cursor-pointer mt-4 mr-4 p-2 absolute right-full hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
          >
            <RxHamburgerMenu className="size-4 fill-black/60" />
          </button>
          <div className="py-4 h-full flex flex-col">
            {!!history.length && (
              <>
                <div className="px-4">
                  <h3 className="text-lg">Recent lists</h3>
                </div>
                <ul className="p-4 overflow-auto">
                  {history.map((list) => (
                    <li
                      key={list.id}
                      className="first:-mt-2 last:-mb-2 flex group hover:bg-white dark:hover:bg-slate-600 bg-transparent transition-colors p-2 -mx-2 rounded-md"
                    >
                      <Link
                        className="w-full py-2 -my-2 block"
                        href={`/list/${list.id}`}
                      >
                        {list.name}
                      </Link>
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-all text-slate-400 cursor-pointer hover:text-slate-800 "
                        onClick={() => remove(list.id)}
                      >
                        <IoIosClose className="w-6 h-6" />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-slate-300 dark:border-slate-700 my-3"></div>
              </>
            )}
            <div className="px-2">
              <Link
                href="/"
                className="cursor-pointer group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10 hover:bg-white dark:hover:bg-slate-600 transition-colors"
              >
                <FiPlusSquare />
                New List
              </Link>
              <ThemeSwitch />
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="cursor-pointer group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10 hover:bg-white dark:hover:bg-slate-600 transition-colors"
              >
                {showCompleted ? <LuEyeOff /> : <LuEye />}
                {showCompleted ? "Hide" : "Show"} Completed
              </button>
            </div>
          </div>
        </div>
        <div
          onClick={() => setNavOpen(false)}
          className={cn(
            " bg-white/80 dark:bg-black/80 fixed inset-0 z-10 pointer-events-none opacity-0 transition-opacity",
            navOpen && "opacity-100 pointer-events-auto"
          )}
        />
      </div>
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
};

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
    const newItem: ClientItem = {
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
