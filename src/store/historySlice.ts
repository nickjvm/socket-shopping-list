import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { fetchLists } from "@/app/actions/lists";

export interface ListHistoryItem {
  id: string;
  name: string;
}

interface HistoryState {
  history: ListHistoryItem[];
  pending: boolean;
}

const HISTORY_KEY = "history";

const initialState: HistoryState = {
  history: [],
  pending: true,
};

// Async thunk to fetch history from localStorage and server
export const getHistory = createAsyncThunk<ListHistoryItem[]>(
  "history/getHistory",
  async () => {
    const localHistory =
      typeof window !== "undefined"
        ? window.localStorage.getItem(HISTORY_KEY)?.split(",") || []
        : [];
    const lists = await fetchLists(localHistory);
    return localHistory.map((id) => {
      const list = lists.find((list) => list.id === id)!;
      return { id, name: list.name };
    });
  }
);

const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    remove(state, action: PayloadAction<string>) {
      state.history = state.history.filter(
        (list) => list.id !== action.payload
      );
      if (typeof window !== "undefined") {
        const localHistory =
          window.localStorage.getItem(HISTORY_KEY)?.split(",") || [];
        const newHistory = localHistory.filter((id) => id !== action.payload);
        window.localStorage.setItem(HISTORY_KEY, newHistory.join(","));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getHistory.pending, (state) => {
        state.pending = true;
      })
      .addCase(getHistory.fulfilled, (state, action) => {
        state.history = action.payload;
        state.pending = false;
      })
      .addCase(getHistory.rejected, (state) => {
        state.pending = false;
      });
  },
});

export const { remove } = historySlice.actions;
export default historySlice.reducer;
