import cn from "@/utils/cn";
import { useShoppingList } from "../providers";
import { useRef, useState } from "react";
import { IoIosInformationCircleOutline } from "react-icons/io";

type ItemProps = {
  item: Item;
  onExpand: (item: Item) => void;
};

export default function Item({ item, onExpand }: ItemProps) {
  const [isPendingCompletion, setPendingCompletion] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const { completeItem, uncompleteItem, updateItem } = useShoppingList();
  const { id, dateCompleted, name } = item;

  const timeout = useRef<NodeJS.Timeout | null>(null);
  const itemRef = useRef<HTMLLIElement>(null);

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.checked) {
      clearTimeout(timeout.current!);
      timeout.current = null;
      setPendingCompletion(false);
      uncompleteItem(id);
    } else {
      setPendingCompletion(true);
      timeout.current = setTimeout(() => {
        setPendingCompletion(false);
        completeItem(id);
      }, 5000);
    }
  };

  return (
    <li
      ref={itemRef}
      key={id}
      className={cn(
        isPendingCompletion && "opacity-50",
        dateCompleted && "opacity-50 line-through italic",
        "flex gap-2 py-1 items-start"
      )}
    >
      <input
        type="checkbox"
        name={id}
        onChange={handleToggle}
        className="mt-[5.5px]"
        defaultChecked={!!dateCompleted}
      />
      <label className="sr-only">Mark {name} completed</label>
      <div className="grow flex gap-x-1 flex-wrap">
        <div className="flex items-center gap-1 flex-nowrap">
          <div
            contentEditable
            suppressContentEditableWarning
            data-quantity={item.quantity > 1 ? ` x${item.quantity}` : ""}
            className="min-w-[100px] focus:ring-0 focus:ring-offset-0 focus:outline-none w-full after:content-[attr(data-quantity)] after:text-gray-500 after:dark:text-gray-400"
            autoCorrect="off"
            onFocus={() => {
              setIsFocused(true);
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
          <textarea
            className=" text-gray-500 placeholder-gray-500 placeholder:not-italic text-sm focus:ring-0 focus:ring-offset-0 focus:outline-none w-full resize-none"
            defaultValue={item.details}
            rows={1}
            placeholder="Add note..."
            onFocus={() => {
              setIsFocused(true);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              if (item.details !== e.target.value) {
                updateItem({
                  ...item,
                  details: e.target.value,
                });
              }
            }}
            ref={(el) => {
              if (el) {
                el.style.height = "auto";
                el.style.height = el.scrollHeight + "px";
              }
            }}
            onInput={(e) => {
              const target = e.currentTarget;
              target.style.height = "auto";
              target.style.height = target.scrollHeight + "px";
            }}
          />
        )}
      </div>
      {isFocused && (
        <button
          onClick={() => {
            onExpand(item);
            setTimeout(() => {
              setIsFocused(false);
            }, 1);
          }}
          className="cursor-pointer"
        >
          <IoIosInformationCircleOutline className="w-5 h-5" />
        </button>
      )}
    </li>
  );
}
