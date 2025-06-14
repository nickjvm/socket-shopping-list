type Item = {
  id: string;
  name: string;
  category?: string;
  quantity: number;
  details?: string | null;
  createdAt: number;
  completedAt: number | null;
  weight?: number;
};

type ClientItem = Omit<Item, "dateAdded" | "completedAt" | "id" | "createdAt">;

type PartialWithRequired<T, K extends keyof T> = Pick<T, K> & Partial<T>;
