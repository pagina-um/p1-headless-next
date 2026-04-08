"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const handleToggle = () => {
    const next = isDark ? "light" : "dark";
    // If the new value matches system preference, reset to system
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const systemTheme = systemDark ? "dark" : "light";
    setTheme(next === systemTheme ? "system" : next);
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={theme !== "system" ? isDark : undefined}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-gray-300" />
      ) : (
        <Moon className="w-5 h-5 text-gray-600" />
      )}
    </button>
  );
}
