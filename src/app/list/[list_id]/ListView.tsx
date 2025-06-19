"use client";

import { useState, useEffect, useRef } from "react";
import { TbWindowMaximize } from "react-icons/tb";
import { FiShare } from "react-icons/fi";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { socket } from "@/socket";
import { useShoppingList } from "@/app/providers/ShoppingList";

import DetailsModal, { DetailsModalProps } from "@/app/components/DetailsModal";
import Category from "@/app/components/Category";
import { useDispatch } from "react-redux";
import { add as addHistory, getHistory } from "@/store/historySlice";
import { addNotification } from "@/store/notificationsSlice";
import { AppDispatch } from "@/store";
import Input from "@/app/components/Input";
import EditableHeading from "@/app/components/EditableHeading";
import { renameList } from "@/app/actions/lists";

type ListPageProps = {
  list: {
    id: string;
    name: string;
    items: Item[];
  };
};

export default function ListPage({ list }: ListPageProps) {
  const { addItem, data, setItems } = useShoppingList();
  const dispatch = useDispatch<AppDispatch>();
  const [listName, setListName] = useState(list.name);
  const [modalContext, setModalContext] = useState<
    DetailsModalProps["data"] | null
  >(null);

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      dispatch(addHistory({ id: list.id, name: list.name }));
    }

    function onDisconnect() {
      socket.removeAllListeners("item:categorized");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("list:renamed", ({ id, name }) => {
      if (id === list.id) {
        setListName(name);
      }
      dispatch(getHistory());
    });
    socket.on("item:categorized", ({ category }) => {
      dispatch(
        addNotification({
          message: `Moved to ${category}`,
          type: "info",
          timeout: 3000,
        })
      );
    });

    return () => {
      socket.removeAllListeners("item:categorized");
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  const listRef = useRef<HTMLUListElement>(null);

  function shareList() {
    if (navigator.share) {
      const shareData = {
        title: "Shopping List: " + list.name,
        text: "Take a look at my shopping list.",
        url: window.location.href,
      };

      navigator.share(shareData).catch(console.log);
    } else {
      console.log("Web Share API not supported");
      // Fallback for browsers that don't support the API
    }
  }

  const onDragStart = () => {};
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) {
      return; // dropped outside of any droppable
    }
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return; //dropped in the same place
    }

    // Update the state with the new order
    const start = data.categories.find(
      (c) => c.id === source.droppableId
    ) as Category;
    const finish = data.categories.find(
      (c) => c.id === destination.droppableId
    ) as Category;

    if (start.id === finish.id) {
      // Moving within the same category
      const newItems = Array.from(start.items);
      newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, draggableId);

      const updatedCategory = {
        ...start,
        items: newItems,
      };

      setItems((prevItems) => {
        const nextItems = prevItems
          .map((item) => {
            let index = item.index;
            if (updatedCategory.name === item.category) {
              index = updatedCategory.items.indexOf(item.id);
            }
            return {
              ...item,
              category: item.category === start.id ? finish.id : item.category,
              index,
            };
          })
          .sort((a, b) => a.index - b.index);
        socket.emit("list:sort", nextItems);
        return nextItems;
      });
    } else {
      // Moving between categories
      const startItems = Array.from(start.items);
      startItems.splice(source.index, 1); // Remove from source category
      const finishItems = Array.from(finish.items);
      finishItems.splice(destination.index, 0, draggableId); // Add to destination category
      const updatedStartCategory = {
        ...start,
        items: startItems,
      };
      const updatedFinishCategory = {
        ...finish,
        items: finishItems,
      };

      setItems((prevItems) => {
        const nextItems = prevItems
          .map((item) => {
            const category =
              item.id === draggableId && item.category === start.id
                ? finish.id
                : item.category;
            let index = item.index;
            if (updatedStartCategory.name === category) {
              index = updatedStartCategory.items.indexOf(item.id);
            } else if (updatedFinishCategory.name === category) {
              index = updatedFinishCategory.items.indexOf(item.id);
            }
            return {
              ...item,
              category,
              index,
            };
          })
          .sort((a, b) => a.index - b.index);
        socket.emit("list:sort", nextItems);

        return nextItems;
      });
    }
  };
  const onDragUpdate = () => {};
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 pr-14  border-b border-slate-300 dark:border-slate-700">
        <EditableHeading
          text={listName}
          onChange={async (name) => {
            await renameList(list.id, name);
            setListName(name);
            dispatch(
              addNotification({
                message: `List renamed to ${name}`,
                type: "info",
                timeout: 3000,
              })
            );
            dispatch(getHistory());
            socket.emit("list:rename", {
              id: list.id,
              name,
            });
          }}
        />
        <button
          onClick={shareList}
          className="cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 p-2 rounded transition-colors"
        >
          <FiShare className="w-4 h-4" />
        </button>
      </div>
      <DragDropContext
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragUpdate={onDragUpdate}
      >
        <ul
          className="grow overflow-auto px-4 pt-2 space-y-2"
          ref={listRef}
          id="list"
        >
          {data.categories.map((category) => (
            <Category
              key={category.id}
              setModalContext={setModalContext}
              category={category}
            />
          ))}
        </ul>
      </DragDropContext>
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
        <Input
          type="text"
          name="item"
          spellCheck="false"
          label="Add an item"
          autoCorrect="off"
          className="w-full"
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
