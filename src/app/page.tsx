import { cookies } from "next/headers";
import Home from "./Home";
import { store } from "@/store";
import { getHistory, ListHistoryItem } from "@/store/historySlice";

export default async function HomePage() {
  const cookieStore = await cookies();
  const historyCookie = cookieStore.get("history")?.value ?? "";

  const history = await store.dispatch(
    getHistory({ cookieValue: historyCookie })
  );

  return <Home history={history.payload as ListHistoryItem[]} />;
}
