import { useEffect, useState, useTransition } from "react";
import { useParams } from "next/navigation";

import { fetchRecentlyCompletedItems } from "@/app/actions/items";

import Item from "@/app/components/Item";
import { AiOutlineLoading } from "react-icons/ai";
import { useShoppingList } from "@/app/providers/ShoppingList";
import { GlobalModal } from "@/app/providers/ModalProvider";

export default function RecentlyCompleted() {
  const { data } = useShoppingList();
  const params = useParams();
  const [isPending, startTransition] = useTransition();
  const [completedItemIds, setCompletedItemIds] = useState<string[]>([]);

  useEffect(() => {
    function loadRecentlyCompletedItems() {
      startTransition(async () => {
        const response = await fetchRecentlyCompletedItems(
          params.list_id as string
        );
        if (response.status === 200) {
          setCompletedItemIds(response.data);
        } else {
          console.error(response.message);
        }
      });
    }
    loadRecentlyCompletedItems();
  }, [params.list_id]);

  const categoriesToDisplay = data.categories.filter((category) =>
    category.items.some((itemId) => completedItemIds.includes(itemId))
  );
  return (
    <div className="flex flex-col space-y-4">
      {!completedItemIds.length && !isPending && (
        <p className="text-gray-500">No recently completed items</p>
      )}
      {categoriesToDisplay.map((category) => (
        <div key={category.id}>
          <h3 className="text-lg font-bold mb-2">{category.name}</h3>
          <ul className="mb-2">
            {category.items.map((id) => {
              const item = data.items.find((item) => item.id === id)!;
              return (
                completedItemIds.includes(id) && (
                  <Item key={id} item={item} isDraggable={false} />
                )
              );
            })}
          </ul>
        </div>
      ))}
      {isPending && (
        <AiOutlineLoading className="animate-spin m-auto mb-5 w-8 h-8" />
      )}
      <GlobalModal.Button className="m-auto w-full">Done</GlobalModal.Button>
    </div>
  );
}
