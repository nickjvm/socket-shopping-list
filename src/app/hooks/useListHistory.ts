import { useEffect, useState } from "react";
import { fetchLists } from "../actions/lists";

const HISTORY_KEY = "history";

export function useListHistory() {
  const [history, setHistory] = useState<{ name: string; id: string }[]>([]);

  const [pending, setPending] = useState<boolean>(true);
  useEffect(() => {
    const localHistory =
      window.localStorage.getItem(HISTORY_KEY)?.split(",") || [];
    fetchLists(localHistory).then((lists) => {
      console.log(lists);
      setPending(false);
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

  function remove(id: string) {
    setHistory((prev) => prev.filter((list) => list.id !== id));
    const localHistory =
      window.localStorage.getItem("history")?.split(",") || [];
    const newHistory = localHistory.filter((listId) => listId !== id);
    window.localStorage.setItem("history", newHistory.join(","));
  }
  return { history, pending, remove };
}
