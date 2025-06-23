type List = {
  id: string;
  name: string;
  createdAt: number;
};

type Item = {
  id: string;
  name: string;
  category?: string;
  quantity: number;
  details?: string | null;
  createdAt: number;
  completedAt: number | null;
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

type FormState =
  | {
      type: "error";
      message: string;
      errors: Record<string, string>;
    }
  | {
      type: "success";
      message: string;
    }
  | null;

type ApiResponse<T> =
  | {
      status: 200;
      message: string;
      data: T;
    }
  | {
      status: 400 | 500;
      message: string;
      errors: Record<string, string>;
    };
