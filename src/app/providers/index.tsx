// app/providers.tsx
"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

import { ShoppingListProvider } from "@/app/providers/ShoppingList";
import { ReduxProvider } from "./ReduxProvider";
import { RootState } from "@/store";

type ProvidersProps = {
  preloadedState?: Partial<RootState>;
  children: ReactNode;
};
export function Providers({ children, preloadedState }: ProvidersProps) {
  return (
    <ReduxProvider preloadedState={preloadedState}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ShoppingListProvider>{children}</ShoppingListProvider>
      </ThemeProvider>
    </ReduxProvider>
  );
}
