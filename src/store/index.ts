import { configureStore, combineReducers } from "@reduxjs/toolkit";

import historyReducer from "./historySlice";
import layoutReducer from "./layoutSlice";
import notificationsReducer from "./notificationsSlice";

const rootReducer = combineReducers({
  history: historyReducer,
  layout: layoutReducer,
  notifications: notificationsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
}

export type AppDispatch = ReturnType<typeof makeStore>["dispatch"];
