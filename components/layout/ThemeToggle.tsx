"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface ThemeToggleProps {
  onClose?: () => void;
}

export function ThemeToggle({ onClose }: ThemeToggleProps) {
  // ThemeProvider levert tijdens hydration dezelfde waarde als de server,
  // dus hier is geen "mounted"-omweg meer nodig.
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
    >
      <span>{isDark ? <Sun size={20} /> : <Moon size={20} />}</span>
      <span>{isDark ? "Licht thema" : "Donker thema"}</span>
    </button>
  );
}
