import { useShoppingList } from "@/app/providers/ShoppingList";

import Item from "@/app/components/Item";
import { Droppable } from "@hello-pangea/dnd";

type CategoryProps = {
  category: Category;
  setModalContext: (context: { mode: "edit"; item: Item }) => void;
};

export default function Category({ setModalContext, category }: CategoryProps) {
  const { data, showCompleted } = useShoppingList();

  const items = category.items.map(
    (itemId) => data.items.find((item) => item.id === itemId) as Item
  );

  return (
    <li>
      <h2 className="text-xl font-bold ml-3">{category.name}</h2>
      <Droppable droppableId={category.id}>
        {(provided) => (
          <ul
            className="mb-2"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {items
              .filter((item) => showCompleted || !item.completedAt)
              .map((item, index) => (
                <Item
                  index={index}
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
            {/* todo: add input to add item directly to this category */}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </li>
  );
}
