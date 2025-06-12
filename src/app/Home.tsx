"use client";

import { useEffect, useState } from "react";
import Input from "./components/Input";
import { createList, fetchLists } from "./actions/lists";
import Link from "next/link";

export default function Home() {
  const [history, setHistory] = useState<{ name: string; id: string }[]>([]);
  useEffect(() => {
    const localHistory =
      window.localStorage.getItem("history")?.split(",") || [];
    fetchLists(localHistory).then((lists) => {
      setHistory(
        localHistory.map((id) => {
          const list = lists.find((list) => list.id === id);
          return {
            id,
            name: list ? list.name : "Unknown List",
          };
        })
      );
    });
  }, []);

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 ">
      <div className="w-xl p-4 border border-slate-300 rounded-md shadow-md">
        <form action={createList}>
          <h1 className="text-2xl">Create a list</h1>
          <Input label="List Name" name="name" />
        </form>
        <h2 className="text-xl">Recent Lists</h2>
        <ul>
          {history.map((list) => (
            <li key={list.id}>
              <Link href={`${list.id}`}>{list.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
