import ListView from "./ListView";
import { fetchList } from "@/app/actions/lists";
export default async function ListPage({
  params,
}: {
  params: { list_id: string };
}) {
  const { list_id } = await params;
  const list = await fetchList(list_id);
  return <ListView list={list} />;
}
