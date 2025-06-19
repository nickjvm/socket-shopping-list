import type { Metadata } from "next";
import { cookies } from "next/headers";

import { Geist, Geist_Mono } from "next/font/google";

import { Providers } from "@/app/providers";
import NavMenu from "@/app/components/NavMenu";
import Notifications from "@/app/components/Notifications";

import { ListHistoryItem } from "@/store/historySlice";
import { fetchLists } from "./actions/lists";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "⚡️ Socket Shopping List",
  description: "A Next.js / Socket.IO app by Nick VanMeter",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const historyCookie = cookieStore.get("history")?.value ?? "";

  const ids = historyCookie.split(",");

  let history: ListHistoryItem[] = [];
  if (ids.length) {
    history = await fetchLists(ids);
  }

  const preloadedState = {
    history: {
      history,
      pending: false,
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark:bg-slate-900 dark:text-white`}
      >
        <Providers preloadedState={preloadedState}>
          <div id="layout" className="flex h-full relative overflow-hidden">
            <div className="grow">{children}</div>
            <NavMenu />
            <Notifications />
          </div>
        </Providers>
      </body>
    </html>
  );
}
