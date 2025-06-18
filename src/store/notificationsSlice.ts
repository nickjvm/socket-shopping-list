import { v4 as uuid } from "uuid";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface Notification {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  timeout?: number;
}

interface NotificationsState {
  messages: Notification[];
}

const initialState: NotificationsState = {
  messages: [],
};

// Thunk that handles both adding and removing the notification
export const addNotification = createAsyncThunk(
  "notifications/add",
  async (
    { message, type, timeout }: Omit<Notification, "id">,
    { dispatch }
  ) => {
    const id = uuid();
    const notification: Notification = { id, message, type };

    if (timeout) {
      setTimeout(() => {
        dispatch(removeNotification(id));
      }, timeout);
    }

    return notification;
  }
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    removeNotification(state, action: PayloadAction<string>) {
      state.messages = state.messages.filter(
        (notification) => notification.id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addNotification.fulfilled, (state, action) => {
      state.messages.push(action.payload);
    });
  },
});

export const { removeNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
