"use client";

import Input from "./components/Input";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { AiOutlineLoading } from "react-icons/ai";
import { IoIosClose } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";

import { createList } from "@/app/actions/lists";
import { RootState } from "@/store";
import { remove } from "@/store/historySlice";
import { redirect } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

export default function Home() {
  const { history } = useSelector((state: RootState) => state.history);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const dispatch = useDispatch();

  const handleSubmit = async (
    _: FormState | undefined,
    formData: FormData
  ): Promise<FormState> => {
    const response = await createList(formData);
    if (response?.status === 200) {
      redirect(`/list/${response?.data?.id}`);
    } else {
      return {
        type: "error",
        message: response?.message || "List not created",
        errors: response.errors,
      };
    }
  };

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    handleSubmit,
    null
  );

  useEffect(() => {
    if (isPending || state?.type === "success") {
      setErrors({});
    } else if (state?.type === "error") {
      setErrors(state.errors);
    }
  }, [state, isPending]);

  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 p-4">
      <form className="w-full max-w-xl" action={formAction}>
        <h1 className="text-2xl mb-4">Create a Shopping List</h1>
        <div className="flex gap-2 items-start">
          <Input
            required
            autoFocus
            label="List Name"
            name="name"
            className="w-full"
            error={errors?.name}
            onInput={(e) =>
              (e.target as HTMLInputElement).setCustomValidity("")
            }
          />
          <button
            type="submit"
            disabled={isPending}
            aria-label="Create List"
            className="cursor-pointer px-4 h-[42px] bg-slate-500 rounded-md text-white hover:bg-slate-600 focus-visible:bg-slate-600 transition-colors flex items-center justify-center"
          >
            {isPending ? (
              <AiOutlineLoading className="animate-spin" />
            ) : (
              <FiArrowRight />
            )}
            <span className="sr-only">Create List</span>
          </button>
        </div>
      </form>
      {!!history.length && (
        <div className="w-full max-w-xl border border-slate-200 bg-slate-50 dark:bg-slate-800 rounded-md shadow-md overflow-hidden">
          <h2 className="text-lg py-2 px-4 border-b border-b-slate-300 bg-white dark:bg-slate-800">
            Recent Lists
          </h2>
          <ul className="p-4 max-h-64 overflow-auto">
            {history.map((list) => (
              <li
                key={list.id}
                className="first:-mt-2 last:-mb-2 flex group hover:bg-slate-200 dark:hover:bg-slate-600 bg-transparent transition-colors p-2 -mx-2 rounded-md"
              >
                <Link
                  className="w-full py-2 -my-2 block"
                  href={`/list/${list.id}`}
                >
                  {list.name}
                </Link>
                <button
                  className="opacity-50 group-hover:opacity-100 transition-all text-slate-400 cursor-pointer hover:text-slate-800"
                  onClick={() => dispatch(remove(list.id))}
                >
                  <IoIosClose className="w-6 h-6" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
