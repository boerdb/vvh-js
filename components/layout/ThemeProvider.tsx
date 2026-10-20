"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

type ThemeSetting = "light" | "dark" | "system";

interface ThemeContextValue {
  theme?: ThemeSetting;
  resolvedTheme?: "light" | "dark";
  setTheme: (theme: "light" | "dark" | "system") => void;
}

const STORAGE_KEY = "theme";
const CHANGE_EVENT = "vvh-theme-change";
const DARK_QUERY = "(prefers-color-scheme: dark)";

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Keuze van deze sessie als localStorage niet werkt (privémodus). */
let memorySetting: ThemeSetting | null = null;

function readSetting(): ThemeSetting {
  if (memorySetting) return memorySetting;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" || stored === "system"
      ? stored
      : "system";
  } catch {
    return memorySetting ?? "system";
  }
}

function subscribeSetting(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function subscribeSystem(onChange: () => void) {
  const mq = window.matchMedia(DARK_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function readSystemDark(): boolean {
  return window.matchMedia(DARK_QUERY).matches;
}

const subscribeNever = () => () => {};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Server en hydration: "system" + licht, net als voorheen; daarna de echte waarden.
  const theme = useSyncExternalStore(subscribeSetting, readSetting, () => "system" as const);
  const systemDark = useSyncExternalStore(subscribeSystem, readSystemDark, () => false);
  const hydrated = useSyncExternalStore(subscribeNever, () => true, () => false);
  const resolvedTheme: "light" | "dark" =
    theme === "system" ? (systemDark ? "dark" : "light") : theme;

  useLayoutEffect(() => {
    // Tijdens hydration klopt resolvedTheme nog niet; het init-script in layout.tsx heeft de klasse al gezet.
    if (!hydrated) return;
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  }, [hydrated, resolvedTheme]);

  const setTheme = useCallback((next: "light" | "dark" | "system") => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Geen opslag: thema geldt dan alleen voor deze sessie.
      memorySetting = next;
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
