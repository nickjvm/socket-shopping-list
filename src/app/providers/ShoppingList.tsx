import { createContext, useContext, useEffect, useRef, useState } from "react";
import { CATEGORIES } from "../constants";
import { socket } from "@/socket";
import { useParams } from "next/navigation";

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
  deleteCompletedItems: () => void;
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
  const params = useParams();
  const listId = useRef<string | null>((params.list_id as string) || null);

  useEffect(() => {
    if (listId.current && params.list_id !== listId.current) {
      setItems([]);
    }
    function onConnect() {
      if (listId.current && params.list_id !== listId.current) {
        disconnectFromList(listId.current);
      }

      if (params.list_id) {
        connectToList(params.list_id as string);
        listId.current = (params.list_id as string) || null;
      }
    }

    function onDisconnect() {
      if (listId.current) {
        disconnectFromList(listId.current);
        listId.current = null;
      }
    }

    if (socket.connected) {
      onConnect();
    }
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [params.list_id]);

  useEffect(() => {
    setShowCompleted(localStorage.getItem("showCompleted") === "true");
  }, []);

  useEffect(() => {
    if (showCompleted) {
      localStorage.setItem("showCompleted", "true");
    } else {
      localStorage.removeItem("showCompleted");
    }
  }, [showCompleted]);

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

  function disconnectFromList(listId: string) {
    socket.emit("list:disconnect", listId);
  }

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      socket.emit("hello");
      socket.onAny(console.log);

      socket.on("items:retrieved", setItems);

      socket.on("item:added", (item: Item) => {
        setItems((prev) => [...prev, item].filter((i) => i.id));
      });

      socket.on("item:completed", (itemId: string) => {
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, completedAt: Date.now() } : item
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

      socket.on("items:deleted", (itemIds: string[]) => {
        setItems((prev) => prev.filter((item) => !itemIds.includes(item.id)));
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
      socket.removeAllListeners("items:retrieved");
      socket.removeAllListeners("item:added");
      socket.removeAllListeners("item:completed");
      socket.removeAllListeners("item:uncompleted");
      socket.removeAllListeners("item:deleted");
      socket.removeAllListeners("item:updated");
      socket.offAny();
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      onDisconnect();
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
    setItems((prev) => [
      ...prev,
      { ...newItem, category: category || "Other" } as Item,
    ]);
    socket.emit("item:add", newItem);
  };

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              completedAt: item.completedAt ? null : Date.now(),
            }
          : item
      )
    );
  };

  const deleteCompletedItems = () => {
    const completedItems = items.filter((item) => item.completedAt);
    if (completedItems.length === 0) {
      return;
    }

    socket.emit("items:delete", {
      listId: listId.current,
      itemIds: completedItems.map((i) => i.id),
    });
  };

  const updateItem = (item: Item) => {
    setItems(() => {
      return items.map((prevItem) =>
        prevItem.id === item.id
          ? { ...prevItem, ...item, id: item.id }
          : prevItem
      );
    });
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
        deleteCompletedItems,
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
