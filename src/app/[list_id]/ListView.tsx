"use client";

import { Fragment, useState, useEffect } from "react";
import { TbWindowMaximize } from "react-icons/tb";
import { socket } from "@/socket";

import { useShoppingList } from "@/app/providers";

import Item from "@/app/components/Item";
import DetailsModal, { DetailsModalProps } from "@/app/components/DetailsModal";
import SettingsDropdown from "@/app/components/SettingsDropdown";

type ListPageProps = {
  list: {
    id: string;
    name: string;
    items: Item[];
  };
};

export default function ListPage({ list }: ListPageProps) {
  const { addItem, items, connectToList } = useShoppingList();
  const [modalContext, setModalContext] = useState<
    DetailsModalProps["data"] | null
  >(null);

  const itemsByCategory = items.reduce((acc, item: Item) => {
    if (!acc[item.category || "Other"]) {
      acc[item.category || "Other"] = [];
    }
    acc[item.category || "Other"].push(item);
    return acc;
  }, {} as Record<string, Item[]>);

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      connectToList(list.id);
      socket.onAny(console.log);
      const history = window.localStorage.getItem("history")?.split(",") || [];
      window.localStorage.setItem(
        "history",
        [...new Set([list.id, ...history])].join(",")
      );
    }

    function onDisconnect() {
      // disconnectFromList()
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [list.id]);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold">{list.name}</h1>
        <SettingsDropdown />
      </div>
      <ul className="grow overflow-auto px-4">
        {Object.keys(itemsByCategory).map((category) => (
          <Fragment key={category}>
            <li>
              <h2 className="text-xl font-bold">{category}</h2>
              <ul className="mb-2">
                {itemsByCategory[category].map((item) => (
                  <Item
                    item={item}
                    key={item.id}
                    onExpand={() =>
                      setModalContext({
                        mode: "edit",
                        item,
                      })
                    }
                  />
                ))}
              </ul>
            </li>
          </Fragment>
        ))}
      </ul>
      <form
        className="mt-auto gap-2 flex p-4 border-t border-slate-300"
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const itemName = formData.get("item") as string;
          if (!itemName) return;
          addItem({ name: itemName });
          (e.target as HTMLFormElement).reset();
        }}
      >
        <input
          type="text"
          name="item"
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          placeholder="Add an item..."
          className="border border-gray-500 rounded w-full px-4 py-2 dark:bg-slate-800"
        />
        <button
          type="button"
          onClick={(e) => {
            const formData = new FormData(e.currentTarget.form!);
            const itemName = formData.get("item") as string;
            setModalContext({
              mode: "add",
              item: {
                name: itemName,
              } as Item,
            });
          }}
          className="p-2 rounded bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 cursor-pointer"
        >
          <TbWindowMaximize className="w-6 h-6" />
        </button>
      </form>
      {modalContext && (
        <DetailsModal
          onClose={() => setModalContext(null)}
          data={modalContext}
        />
      )}
    </div>
  );
}
