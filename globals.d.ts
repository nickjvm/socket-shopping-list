type Item = {
  id: string;
  name: string;
  category?: string;
  quantity: number;
  details?: string | null;
  createdAt: string;
  completedAt: string | null;
  index: number;
};

type Category = {
  id: string;
  name: string;
  items: string[];
};

type ClientItem = Omit<
  Item,
  "dateAdded" | "completedAt" | "id" | "createdAt" | "index"
>;

type PartialWithRequired<T, K extends keyof T> = Pick<T, K> & Partial<T>;
