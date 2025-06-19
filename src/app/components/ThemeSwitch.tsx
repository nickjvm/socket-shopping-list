// app/components/ThemeSwitch.tsx
"use client";

import { FiSun, FiMoon } from "react-icons/fi";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

type ThemeSwitchProps = {
  onClick?: (nextTheme: string) => void;
};
export default function ThemeSwitch({ onClick }: ThemeSwitchProps) {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      className="cursor-pointer group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10  hover:bg-white dark:hover:bg-slate-600 transition-colors"
      onClick={() => {
        const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
        if (onClick) {
          onClick(nextTheme);
        }
        setTheme(nextTheme);
      }}
    >
      {resolvedTheme === "dark" && (
        <>
          <FiSun /> Switch to Light Mode
        </>
      )}
      {resolvedTheme === "light" && (
        <>
          <FiMoon /> Switch to Dark Mode
        </>
      )}
    </button>
  );
}
