type Item = {
  id: string;
  name: string;
  category?: string;
  quantity: number;
  details?: string | null;
  dateAdded: number;
  dateCompleted: number | null;
  weight?: number;
};

type ClientItem = Omit<Item, "dateAdded" | "dateCompleted" | "id">;

type PartialWithRequired<T, K extends keyof T> = Pick<T, K> & Partial<T>;
