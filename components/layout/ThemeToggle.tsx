"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";

interface ThemeToggleProps {
  onClose?: () => void;
}

export function ThemeToggle({ onClose }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button type="button" className="menu-item" aria-label="Thema wisselen">
        <span aria-hidden="true">
          <Moon size={20} />
        </span>
        <span>Thema</span>
      </button>
    );
  }

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
    >
      <span>{isDark ? <Sun size={20} /> : <Moon size={20} />}</span>
      <span>{isDark ? "Licht thema" : "Donker thema"}</span>
    </button>
  );
}
