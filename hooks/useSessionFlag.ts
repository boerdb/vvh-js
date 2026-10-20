"use client";

import { useCallback, useSyncExternalStore } from "react";

const CHANGE_EVENT = "vvh-session-flag-change";

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

/** Vlag in sessionStorage (bijv. een weggeklikte banner), alleen voor deze sessie. */
export function useSessionFlag(key: string): [boolean, () => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return sessionStorage.getItem(key) === "1";
      } catch {
        return false;
      }
    },
    () => false
  );

  const set = useCallback(() => {
    try {
      sessionStorage.setItem(key, "1");
    } catch {
      // Geen opslag (privémodus): de banner verdwijnt dan tot herladen niet.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, [key]);

  return [value, set];
}
