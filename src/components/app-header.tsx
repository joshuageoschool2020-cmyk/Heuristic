"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const THEME_STORAGE_KEY = "heuristic_theme_v1";

type ThemeMode = "black" | "navy";

export default function AppHeader() {
  const [theme, setTheme] = useState<ThemeMode>("black");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    const nextTheme = savedTheme === "navy" ? "navy" : "black";
    setTheme(nextTheme);
    document.body.dataset.theme = nextTheme;
  }, []);

  const handleToggleTheme = () => {
    const nextTheme: ThemeMode = theme === "black" ? "navy" : "black";
    setTheme(nextTheme);
    document.body.dataset.theme = nextTheme;
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  };

  return (
    <header className="app-header sticky top-0 z-20 animate-fade-in border-b backdrop-blur">
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="text-base font-bold tracking-tight text-white">
          heuristic_
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <Link className="text-white/80 transition-colors hover:text-[#79A7FF]" href="/library">
            Library
          </Link>
          <button
            type="button"
            onClick={handleToggleTheme}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/85 transition-all hover:border-[#79A7FF] hover:text-white"
          >
            {theme === "black" ? "Dark Navy" : "Pure Black"}
          </button>
        </div>
      </nav>
    </header>
  );
}
