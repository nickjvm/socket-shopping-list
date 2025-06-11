type Item = {
  id: string;
  name: string;
  category?: string;
  quantity: number;
  details: string;
  dateAdded: number;
  dateCompleted: number | null;
  weight?: number;
};

type PartialWithRequired<T, K extends keyof T> = Pick<T, K> & Partial<T>;
