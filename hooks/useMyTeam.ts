"use client";

import { useCallback, useSyncExternalStore } from "react";
import { getTeamOption } from "@/lib/constants/teams";

const STORAGE_KEY = "vvh-my-team";
const CHANGE_EVENT = "vvh-my-team-change";

function read(): string | null {
  try {
    const code = localStorage.getItem(STORAGE_KEY);
    return code && getTeamOption(code) ? code : null;
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Favoriete team, standaard filter op de wedstrijdpagina's en Home. */
export function useMyTeam() {
  const myTeam = useSyncExternalStore(subscribe, read, () => null);

  const setMyTeam = useCallback((code: string | null) => {
    try {
      if (code) localStorage.setItem(STORAGE_KEY, code);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Privémodus zonder opslag: dan alleen geen voorkeur onthouden.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return { myTeam, setMyTeam };
}
