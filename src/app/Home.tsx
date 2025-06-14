"use client";

import Input from "./components/Input";
import { createList } from "./actions/lists";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { IoIosClose } from "react-icons/io";
import { useListHistory } from "./hooks/useListHistory";

export default function Home() {
  const { history, remove: deleteFromHistory } = useListHistory();
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 p-4">
      <form action={createList} className="w-full max-w-xl">
        <h1 className="text-2xl mb-4">Create a Shopping List</h1>
        <div className="flex gap-2">
          <Input autoFocus label="List Name" name="name" className="w-full" />
          <button
            type="submit"
            className="cursor-pointer px-4 py-2 bg-slate-500 rounded-md text-white hover:bg-slate-600 focus-visible:bg-slate-600 transition-colors flex items-center justify-center"
          >
            <FiArrowRight />
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
                  className="opacity-0 group-hover:opacity-100 transition-all text-slate-400 cursor-pointer hover:text-slate-800"
                  onClick={() => deleteFromHistory(list.id)}
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
