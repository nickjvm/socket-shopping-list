// app/providers.tsx
"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

import { ShoppingListProvider } from "@/app/providers/ShoppingList";
import { Provider } from "react-redux";
import { store } from "@/store";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ShoppingListProvider>{children}</ShoppingListProvider>
      </ThemeProvider>
    </Provider>
  );
}
