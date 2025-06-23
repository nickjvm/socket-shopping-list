import { useShoppingList } from "@/app/providers/ShoppingList";

import DraggableItem from "@/app/components/DraggableItem";
import { Droppable } from "@hello-pangea/dnd";
import Input from "./Input";
import { useActionState, useRef } from "react";

type CategoryProps = {
  category: Category;
  setModalContext: (context: { mode: "edit"; item: Item }) => void;
};

export default function Category({ setModalContext, category }: CategoryProps) {
  const { data, showCompleted, addItem } = useShoppingList();

  const items = category.items.map(
    (itemId) => data.items.find((item) => item.id === itemId) as Item
  );

  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (_: FormState, formData: FormData): FormState => {
    const itemName = formData.get(`new-${category.name}-item`) as string;
    if (!itemName) {
      return {
        type: "error",
        message: "Item name is required",
        errors: { [`new-${category.name}-item`]: "Item name cannot be empty" },
      };
    }

    addItem({ name: itemName, category: category.name });
    inputRef.current?.form?.reset();

    return {
      type: "success",
      message: `Item added to ${category.name}`,
    };
  };

  const [, formAction] = useActionState<FormState, FormData>(
    handleSubmit,
    null
  );
  const itemsToDisplay = items.filter(
    (item) => showCompleted || !item.completedAt
  );

  if (!itemsToDisplay.length) {
    return null;
  }
  return (
    <li className="-mx-4 px-4 border-b border-slate-300 pb-2 dark:border-slate-700 last:border-0">
      <h2 className="text-xl font-bold ml-3 mb-2">{category.name}</h2>
      <Droppable droppableId={category.id}>
        {(provided) => (
          <ul ref={provided.innerRef} {...provided.droppableProps}>
            {itemsToDisplay.map((item, index) => (
              <DraggableItem
                index={index}
                item={item}
                key={item.id || index}
                onExpand={() =>
                  setModalContext({
                    mode: "edit",
                    item,
                  })
                }
              />
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>

      <div className="flex space-x-2 ml-3 py-1 items-center relative">
        <span
          className="w-5 h-5 border border-slate-400 dark:border-slate-600 border-dashed rounded-full cursor-default"
          onClick={() => inputRef.current?.focus()}
        ></span>
        <form action={formAction}>
          <Input
            ref={inputRef}
            type="text"
            label={`Add item to ${category.name}`}
            name={`new-${category.name}-item`}
            labelHidden
            inputClassName="border-0 without-ring px-0 py-0 line-height-1"
            id={`new-${category.name}-item`}
          />
        </form>
      </div>
    </li>
  );
}
