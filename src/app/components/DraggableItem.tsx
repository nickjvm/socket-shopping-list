import { Draggable } from "@hello-pangea/dnd";

import Item from "@/app/components/Item";

type ItemProps = {
  item: Item;
  onExpand?: (item: Item) => void;
  index: number;
};

export default function DraggableItem({ item, index, ...props }: ItemProps) {
  return (
    <Draggable
      draggableId={item.id || index + ""}
      index={index}
      key={item.id || index}
    >
      {(provided) => (
        <Item item={item} provided={provided} isDraggable={true} {...props} />
      )}
    </Draggable>
  );
}
