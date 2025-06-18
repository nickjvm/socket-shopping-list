import { createContext, useContext, useEffect, useState } from "react";
import { CATEGORIES } from "../constants";
import { socket } from "@/socket";

type ShoppingListData = {
  categories: Category[];
  items: Item[];
};

type ShoppingListContextType = {
  data: ShoppingListData;
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
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

  const data: ShoppingListData = {
    categories: CATEGORIES.filter((c) =>
      items.some(
        (item) =>
          item.category === c && (showCompleted ? true : !item.completedAt)
      )
    ).map((c) => ({
      id: c,
      name: c,
      items: items.filter((item) => item.category === c).map((item) => item.id),
    })),
    items: items,
  };

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
            item.id === itemId
              ? { ...item, completedAt: Date.now().toString() }
              : item
          )
        );
      });

      socket.on("item:uncompleted", (itemId: string) => {
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, completedAt: null } : item
          )
        );
      });

      socket.on("item:deleted", (itemId: string) => {
        setItems((prev) => prev.filter((item) => item.id !== itemId));
      });

      socket.on("item:updated", (item: Item) => {
        // todo show notification if item is recategorized by AI on server
        setItems((prev) =>
          prev.map((prevItem) =>
            prevItem.id === item.id ? { ...prevItem, ...item } : prevItem
          )
        );
      });
    }

    function onDisconnect() {
      console.log("Disconnected from socket");
      socket.removeAllListeners("items:retrieved");
      socket.removeAllListeners("item:added");
      socket.removeAllListeners("item:completed");
      socket.removeAllListeners("item:uncompleted");
      socket.removeAllListeners("item:deleted");
      socket.removeAllListeners("item:updated");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

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
  };

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              completedAt: item.completedAt ? null : Date.now().toString(),
            }
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
    socket.emit("item:delete", id);
  };

  return (
    <ShoppingListContext.Provider
      value={{
        data,
        setItems,
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
