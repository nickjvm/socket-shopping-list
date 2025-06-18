import ListView from "./ListView";
import { fetchList } from "@/app/actions/lists";

type PageProps = {
  params: Promise<{ list_id: string }>;
};
export default async function ListPage({ params }: PageProps) {
  const { list_id } = await params;
  const list = await fetchList(list_id);
  return <ListView list={list} />;
}
