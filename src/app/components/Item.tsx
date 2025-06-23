import { useEffect, useRef, useState } from "react";
import { IoIosCheckmark, IoIosInformationCircleOutline } from "react-icons/io";
import { useShoppingList } from "../providers/ShoppingList";
import { socket } from "@/socket";
import { RxDragHandleDots2 } from "react-icons/rx";
import cn from "@/utils/cn";
import { DraggableProvided } from "@hello-pangea/dnd";

type ItemProps =
  | {
      isDraggable: true;
      item: Item;
      onExpand?: (item: Item) => void;
      provided: DraggableProvided;
    }
  | {
      isDraggable?: false;
      item: Item;
      onExpand?: (item: Item) => void;
      provided?: undefined;
    };
export default function Item({
  item,
  onExpand,
  provided,
  isDraggable,
}: ItemProps) {
  const [isPendingCompletion, setPendingCompletion] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const { completeItem, uncompleteItem, updateItem } = useShoppingList();
  const { id, completedAt, name } = item;

  const checked = !!completedAt || isPendingCompletion;
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const itemRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const scrollToItem = (itemId: string) => {
      if (item.id === itemId) {
        // Find the closest parent UL and scroll it instead of the document body
        const ul = itemRef.current?.closest("#list");
        if (ul && itemRef.current) {
          const itemRect = itemRef.current.getBoundingClientRect();
          const ulRect = ul.getBoundingClientRect();
          if (itemRect.top < 0 || itemRect.bottom > ulRect.bottom) {
            const offset =
              itemRect.top -
              ulRect.top -
              ul.clientHeight / 2 +
              itemRect.height / 2;
            ul.scrollBy({ top: offset, behavior: "smooth" });
          }
        }
      }
    };
    socket.on("item:highlight", scrollToItem);
    return () => {
      socket.off("item:highlight", scrollToItem);
    };
  }, [item.id]);

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.checked) {
      clearTimeout(timeout.current!);
      timeout.current = null;
      setPendingCompletion(false);
      uncompleteItem(id);
    } else {
      setPendingCompletion(true);
      timeout.current = setTimeout(() => {
        completeItem(id);
      }, 2000);
    }
  };

  useEffect(() => {
    if (completedAt) {
      setPendingCompletion(false);
      clearTimeout(timeout.current!);
      timeout.current = null;
    }
  }, [completedAt]);

  return (
    <li
      {...(isDraggable && provided ? provided.draggableProps : {})}
      ref={(el) => {
        itemRef.current = el;
        provided?.innerRef(el);
      }}
      className={cn(
        isPendingCompletion && "opacity-50",
        completedAt && "opacity-50 line-through italic",
        "flex gap-2 py-1 group items-start"
      )}
    >
      {!!isDraggable && (
        <div
          {...provided.dragHandleProps}
          className={cn(
            "-ml-3 opacity-30  group-hover:opacity-100 transition-opacity mt-1"
          )}
        >
          <RxDragHandleDots2 />
        </div>
      )}
      <label className="min-w-5 h-5 cursor-pointer mt-[1.5px]">
        <div
          className={cn(
            "rounded-full border border-slate-600 w-5 h-5 relative bg-white dark:bg-slate-900",
            checked &&
              "bg-slate-900 border-slate-900 text-white dark:bg-white dark:text-slate-800 dark:border-white"
          )}
        >
          {checked && (
            <IoIosCheckmark className=" w-7 h-7 absolute top-1/2 left-1/2 -translate-1/2" />
          )}
        </div>
        <span className="sr-only">
          <input
            type="checkbox"
            name={id}
            onChange={handleToggle}
            className="mt-[5px] hidden"
            checked={checked}
          />
          Mark {name} completed
        </span>
      </label>
      <div className="grow flex gap-x-1 flex-wrap">
        <div className="flex items-center gap-1 flex-nowrap w-full">
          <div
            contentEditable
            role="textbox"
            tabIndex={0}
            aria-label="Item name"
            suppressContentEditableWarning
            data-quantity={item.quantity > 1 ? ` x${item.quantity}` : ""}
            className="min-w-[100px] focus:ring-0 focus:ring-offset-0 focus:outline-none w-full after:content-[attr(data-quantity)] after:text-gray-500 after:dark:text-gray-400"
            autoCorrect="off"
            onFocus={() => {
              setIsFocused(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                (e.target as HTMLDivElement).blur();
              }
            }}
            onBlur={(e) => {
              if (e.target.textContent !== name) {
                updateItem({
                  ...item,
                  name: (e.target as HTMLDivElement).textContent?.trim() || "",
                });
              }
              if (!itemRef.current?.contains(e.relatedTarget)) {
                setIsFocused(false);
              }
            }}
          >
            {name}
          </div>
        </div>
        {(item.details || isFocused) && (
          <div
            contentEditable
            spellCheck="false"
            role="textbox"
            aria-multiline="true"
            tabIndex={0}
            aria-label="Item details"
            suppressContentEditableWarning
            className=" text-gray-500 placeholder-gray-500 placeholder:not-italic text-sm focus:ring-0 focus:ring-offset-0 focus:outline-none w-full resize-none"
            onFocus={(e) => {
              setIsFocused(true);
              if (e.target.textContent === "Add a note...") {
                e.target.textContent = "";
              }
            }}
            onBlur={(e) => {
              if (!itemRef.current?.contains(e.relatedTarget)) {
                setIsFocused(false);
              }
              if (item.details !== e.target.textContent) {
                updateItem({
                  ...item,
                  details: e.target.textContent,
                });
              }
              if (e.target.textContent === "") {
                e.target.textContent = "Add a note...";
              }
            }}
          >
            {item.details || "Add a note..."}
          </div>
        )}
      </div>
      {onExpand && (
        <button
          onClick={() => {
            onExpand(item);
            setIsFocused(false);
          }}
          className={cn(
            "cursor-pointer opacity-20 group-hover:opacity-100 transition-opacity",
            isFocused && "opacity-100"
          )}
        >
          <IoIosInformationCircleOutline className="w-5 h-5" />
        </button>
      )}
    </li>
  );
}
