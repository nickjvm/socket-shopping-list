import { configureStore } from "@reduxjs/toolkit";
import historyReducer from "./historySlice";
import layoutReducer from "./layoutSlice";
import notificationsReducer from "./notificationsSlice";

export const store = configureStore({
  reducer: {
    history: historyReducer,
    layout: layoutReducer,
    notifications: notificationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
