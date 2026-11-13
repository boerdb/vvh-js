"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const DAG_KEY = "vvh:bezoek-dag";

function vandaag(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Amsterdam" }).format(new Date());
}

function isGeinstalleerd(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || Boolean(nav.standalone);
}

function stuur(bericht: { bezoeker?: "app" | "browser"; pagina?: string }): boolean {
  const data = JSON.stringify(bericht);
  try {
    if (navigator.sendBeacon) return navigator.sendBeacon("/api/bezoek", data);
    void fetch("/api/bezoek", { method: "POST", body: data, keepalive: true }).catch(() => {});
    return true;
  } catch {
    return false;
  }
}

/**
 * Anonieme telling: per toestel één "bezoeker" per dag (onthouden in localStorage)
 * en elke geopende pagina. Er gaat geen ID mee; de server bewaart alleen dagtotalen.
 */
export function BezoekTeller() {
  const pathname = usePathname();

  useEffect(() => {
    // Ontwikkelen en testen tellen niet mee
    if (process.env.NODE_ENV !== "production" || !navigator.onLine) return;
    // "/" stuurt meteen door naar /home; die wordt daar geteld
    if (!pathname || pathname === "/") return;

    let bezoeker: "app" | "browser" | undefined;
    const dag = vandaag();
    try {
      if (localStorage.getItem(DAG_KEY) !== dag) {
        bezoeker = isGeinstalleerd() ? "app" : "browser";
      }
    } catch {
      // Geen localStorage (privévenster): dan niet als bezoeker tellen
    }

    if (stuur({ bezoeker, pagina: pathname }) && bezoeker) {
      try {
        localStorage.setItem(DAG_KEY, dag);
      } catch {}
    }
  }, [pathname]);

  return null;
}
