import { useShoppingList } from "@/app/providers";

import Item from "@/app/components/Item";

type CategoryProps = {
  category: Category;
  setModalContext: (context: { mode: "edit"; item: Item }) => void;
};

export default function Category({ setModalContext, category }: CategoryProps) {
  const { data } = useShoppingList();

  const items = category.items.map(
    (itemId) => data.items.find((item) => item.id === itemId) as Item
  );

  console.log(category.items, items);
  return (
    <li>
      <h2 className="text-xl font-bold">{category.name}</h2>
      <ul className="mb-2">
        {items.map((item) => (
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
  );
}
