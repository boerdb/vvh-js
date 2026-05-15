"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface ThemeToggleProps {
  onClose?: () => void;
}

export function ThemeToggle({ onClose }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      className="menu-item"
      onClick={() => {
        setTheme(isDark ? "light" : "dark");
        onClose?.();
      }}
      aria-label={isDark ? "Licht thema" : "Donker thema"}
      suppressHydrationWarning
    >
      <span suppressHydrationWarning>
        {resolvedTheme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
      </span>
      <span suppressHydrationWarning>
        {resolvedTheme === "dark" ? "Licht thema" : "Donker thema"}
      </span>
    </button>
  );
}
