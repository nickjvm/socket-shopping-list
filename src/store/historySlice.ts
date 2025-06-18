import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { fetchLists } from "@/app/actions/lists";

export interface ListHistoryItem {
  id: string;
  name: string;
}

export interface HistoryState {
  history: ListHistoryItem[];
  pending: boolean;
}

const HISTORY_KEY = "history";

const initialState: HistoryState = {
  history: [],
  pending: true,
};

// Async thunk to fetch history from cookies and server
export const getHistory = createAsyncThunk<
  ListHistoryItem[],
  { cookieValue?: string } | undefined
>("history/getHistory", async ({ cookieValue } = {}) => {
  // On server, pass cookieValue from server context
  // On client, cookieValue is undefined, so read from document.cookie
  let ids: string[] = [];
  if (typeof window === "undefined") {
    ids = cookieValue ? cookieValue.split(",") : [];
  } else {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(HISTORY_KEY + "="));
    ids = match ? match.split("=")[1].split(",") : [];
  }
  if (!ids.length) return [];
  const lists = await fetchLists(ids);
  return ids
    .map((id) => {
      const list = lists.find((list) => list.id === id);
      return list ? { id, name: list.name } : null;
    })
    .filter(Boolean) as ListHistoryItem[];
});

const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    remove(state, action: PayloadAction<string>) {
      console.log(action);
      state.history = state.history.filter(
        (list) => list.id !== action.payload
      );
      // Update cookie on client
      if (typeof window !== "undefined") {
        const match = document.cookie
          .split("; ")
          .find((row) => row.startsWith(HISTORY_KEY + "="));
        const ids = match ? match.split("=")[1].split(",") : [];
        const newIds = ids.filter((id) => id !== action.payload);
        document.cookie = `${HISTORY_KEY}=${newIds.join(",")}; path=/`;
      }
    },
    add(state, action: PayloadAction<ListHistoryItem>) {
      // Add to state
      state.history = [
        action.payload,
        ...state.history.filter((item) => item.id !== action.payload.id),
      ];
      // Update cookie on client
      if (typeof window !== "undefined") {
        const match = document.cookie
          .split("; ")
          .find((row) => row.startsWith(HISTORY_KEY + "="));
        const ids = match ? match.split("=")[1].split(",") : [];
        const newIds = [
          action.payload.id,
          ...ids.filter((id) => id !== action.payload.id),
        ];
        document.cookie = `${HISTORY_KEY}=${newIds.join(",")}; path=/`;
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

export const { remove, add } = historySlice.actions;
export default historySlice.reducer;
