"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { remove } from "@/store/historySlice";

export default function NotFound() {
  const params = useParams();
  const listId = params.list_id as string;
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(remove(listId));
  }, [listId, dispatch]);

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      {/* No support for metadata in not-found pages
      https://github.com/vercel/next.js/issues/45620#issuecomment-1827734000
      */}
      <title>List Not Found | Socket Shopping List</title>
      <h2 className="font-bold text-xl">List Not Found</h2>
      <p>The list you are trying to access does not exist.</p>
      <Link
        href="/"
        className="rounded px-4 py-2 bg-white border dark:bg-slate-700 border-slate-800 dark:border-slate-800"
      >
        Return Home
      </Link>
    </div>
  );
}
