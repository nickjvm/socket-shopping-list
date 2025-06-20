import React, { useActionState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { TbTrash } from "react-icons/tb";

import { useShoppingList } from "@/app/providers/ShoppingList";

import Input from "./Input";
import Select from "./Select";

export type DetailsModalProps = {
  data: {
    mode: "add" | "edit";
    item: Item;
  };
  onClose: () => void;
};

const DetailsModal: React.FC<DetailsModalProps> = ({ data, onClose }) => {
  const { addItem, updateItem, removeItem } = useShoppingList();
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = (
    _: FormState | undefined,
    formData: FormData
  ): FormState => {
    const itemName = formData.get("item") as string;
    if (!itemName) {
      return {
        type: "error",
        message: "Item name is required",
        errors: { item: "Item name cannot be empty" },
      };
    }

    if (data.mode === "edit") {
      // If editing, we assume the item already exists and we just update it
      updateItem({
        ...data.item,
        name: itemName,
        category: formData.get("category") as string,
        quantity: parseInt(formData.get("quantity") as string, 10) || 1,
        details: formData.get("details") as string,
      });
    } else {
      addItem({
        name: itemName,
        category: formData.get("category") as string,
        quantity: parseInt(formData.get("quantity") as string, 10) || 1,
        details: formData.get("details") as string,
      });
    }

    return {
      type: "success",
      message:
        data.mode === "edit"
          ? "Item updated successfully"
          : "Item added successfully",
    };
  };

  const [state, submitAction, isPending] = useActionState<FormState, FormData>(
    handleSubmit,
    null
  );

  useEffect(() => {
    if (isPending) {
      setErrors({});
    } else if (state?.type === "success") {
      setErrors({});
      onClose();
    } else if (state?.type === "error") {
      setErrors(state.errors);
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [state, isPending]);

  if (!data) {
    return null;
  }

  return (
    <div
      className="modal-backdrop  bg-slate-800/50 dark:bg-slate-400/50 fixed top-0 left-0 right-0 bottom-0"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="modal fixed bottom-0 left-0 right-0 p-4 rounded-t-xl bg-white dark:bg-slate-600 animate-slide-in-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold dark:text-white">
            {data.mode === "edit" ? "Edit Item" : "Add Item"}
          </h2>
          <button
            onClick={onClose}
            className="dark:text-white hover:text-gray-300 cursor-pointer"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form className="mt-auto grid gap-2 gap-y-3" action={submitAction}>
          <div className="flex gap-2">
            <Input
              required
              label="Item Name"
              error={errors?.item}
              type="text"
              name="item"
              id="item"
              autoFocus
              defaultValue={data.item.name}
              spellCheck="false"
              autoCorrect="off"
              className="w-full"
            />
            <Input
              label="Qty"
              id="quantity"
              type="number"
              name="quantity"
              defaultValue={1}
              inputClassName="w-[60px]"
            />
          </div>
          <Select
            name="category"
            className=""
            // placeholder="Select a category"
            defaultValue={data.item?.category || ""}
            options={[
              "Produce",
              "Meat & Seafood",
              "Bakery",
              "Canned Goods",
              "Beverages",
              "Dairy",
              "Snacks",
              "Pantry Items",
              "Frozen Foods",
              "Household",
              "Personal Care",
              "Baby",
              "Pet Care",
              "Clothing",
              "Other",
            ].map((category) => ({
              value: category,
              label: category,
            }))}
            label="Category"
            id="category"
          />

          <textarea
            placeholder="Additional details (optional)"
            className="w-full dark:bg-slate-900 border rounded border-gray-500 px-4 py-2"
            name="details"
            defaultValue={data.item?.details || ""}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="grow p-2 rounded text-white font-bold bg-slate-700 hover:bg-slate-600 transition cursor-pointer"
            >
              {data.mode === "edit" ? "Update Item" : "Add Item"}
            </button>
            {data.item.id && (
              <button
                type="button"
                onClick={() => {
                  removeItem(data.item.id);
                  onClose();
                }}
                className="bg-red-700 text-white py-2 px-5 rounded hover:bg-red-600 transition cursor-pointer"
              >
                <TbTrash className="w-5 h-5" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default DetailsModal;
