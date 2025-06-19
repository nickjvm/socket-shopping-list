"use client";

import { ReactNode, useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, RootState } from "@/store";

export function ReduxProvider({
  children,
  preloadedState,
}: {
  children: ReactNode;
  preloadedState?: Partial<RootState>;
}) {
  const storeRef = useRef(makeStore(preloadedState));
  return <Provider store={storeRef.current}>{children}</Provider>;
}
