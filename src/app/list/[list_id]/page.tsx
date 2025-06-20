import { Metadata } from "next";
import ListView from "./ListView";
import { fetchList } from "@/app/actions/lists";

type PageProps = {
  params: Promise<{ list_id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { list_id } = await params;
  const list = await fetchList(list_id);

  return {
    title: `🛒 ${list.name} Socket Shopping List`,
    description: `Collaborative shopping list: ${list.name}`,
  };
}
export default async function ListPage({ params }: PageProps) {
  const { list_id } = await params;
  const list = await fetchList(list_id);

  return <ListView list={list} />;
}
