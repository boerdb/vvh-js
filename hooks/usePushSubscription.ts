"use client";

import { useCallback, useEffect, useState } from "react";

const TEAM_KEY = "vvh-push-team";

export type PushStatus =
  | "loading"
  /** Server heeft geen VAPID-sleutels, of geen service worker (dev). */
  | "unavailable"
  /** iPhone/iPad in Safari: alleen vanaf het beginscherm. */
  | "ios-install"
  | "unsupported"
  | "denied"
  | "ready";

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4))
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const raw = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function isIos(): boolean {
  const nav = window.navigator;
  return (
    /iphone|ipad|ipod/i.test(nav.userAgent) ||
    (nav.platform === "MacIntel" && nav.maxTouchPoints > 1)
  );
}

async function registration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  return (await navigator.serviceWorker.getRegistration()) ?? null;
}

async function postJson(url: string, method: string, body: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || `Fout ${res.status}`);
  }
  return res.json();
}

function readTeam(): string | null {
  try {
    return localStorage.getItem(TEAM_KEY);
  } catch {
    return null;
  }
}

const TEAM_CHANGE_EVENT = "vvh-push-team-change";

/** Team dat de server voor dit toestel kent, of null als het niet aangemeld is. */
async function serverTeam(endpoint: string): Promise<string | null> {
  const data = (await postJson("/api/push", "POST", { action: "status", endpoint })) as {
    team: string | null;
  };
  return data.team;
}

function writeTeam(team: string | null) {
  try {
    if (team) localStorage.setItem(TEAM_KEY, team);
    else localStorage.removeItem(TEAM_KEY);
  } catch {
    // Zonder opslag weet de app na herladen alleen niet welk team aan staat.
  }
  window.dispatchEvent(new Event(TEAM_CHANGE_EVENT));
}

/**
 * Meldingen gaan mee met Mijn team: staan ze aan voor een ander team, dan wordt
 * het abonnement stil verplaatst (toestemming is er al, dus geen vraag op het scherm).
 */
export async function followMyTeamWithPush(team: string): Promise<void> {
  if (readTeam() === team) return;
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    // Niet op de lokale waarde vertrouwen (kan ontbreken op iOS): is er een
    // abonnement, vraag dan de server welk team het volgt.
    const sub = await (await registration())?.pushManager.getSubscription();
    if (!sub) return;
    const current = await serverTeam(sub.endpoint);
    if (current === team) {
      writeTeam(team);
      return;
    }
    if (!current) return; // Meldingen staan uit; niet ongevraagd aanzetten.
    await postJson("/api/push", "POST", { subscription: sub.toJSON(), team });
    writeTeam(team);
  } catch (error) {
    // Lukt het niet (offline), dan blijft het oude team staan; Home toont dan "Omzetten".
    console.error("[push] team wijzigen mislukt", error);
  }
}

/** Pushmeldingen voor één team aan- en afmelden. */
export function usePushSubscription() {
  const [status, setStatus] = useState<PushStatus>("loading");
  const [subscribedTeam, setSubscribedTeam] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const next = await (async (): Promise<PushStatus> => {
        if (!("Notification" in window) || !("PushManager" in window)) {
          return isIos() ? "ios-install" : "unsupported";
        }
        const [reg, keyRes] = await Promise.all([
          registration(),
          fetch("/api/push").catch(() => null),
        ]);
        if (!reg || !keyRes?.ok) return "unavailable";
        if (Notification.permission === "denied") return "denied";
        const sub = await reg.pushManager.getSubscription();
        // De server is de bron; lokaal alleen bijwerken zodat de rest het weet.
        const team = sub ? await serverTeam(sub.endpoint).catch(() => readTeam()) : null;
        if (active) {
          writeTeam(team);
          setSubscribedTeam(team);
        }
        return "ready";
      })();
      if (active) setStatus(next);
    })();
    // Team kan elders wijzigen (ster bij het teamfilter → followMyTeamWithPush).
    const onTeamChange = () => setSubscribedTeam(readTeam());
    window.addEventListener(TEAM_CHANGE_EVENT, onTeamChange);
    return () => {
      active = false;
      window.removeEventListener(TEAM_CHANGE_EVENT, onTeamChange);
    };
  }, []);

  const enable = useCallback(async (team: string) => {
    setBusy(true);
    setMessage(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "ready");
        return;
      }
      const reg = await registration();
      if (!reg) throw new Error("App niet volledig geladen; probeer het opnieuw.");
      const { publicKey } = (await (await fetch("/api/push")).json()) as { publicKey: string };
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        }));
      await postJson("/api/push", "POST", { subscription: sub.toJSON(), team });
      writeTeam(team);
      setSubscribedTeam(team);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Aanmelden mislukt");
    } finally {
      setBusy(false);
    }
  }, []);

  const disable = useCallback(async () => {
    setBusy(true);
    setMessage(null);
    try {
      const sub = await (await registration())?.pushManager.getSubscription();
      if (sub) {
        await postJson("/api/push", "DELETE", { endpoint: sub.endpoint }).catch(() => null);
        await sub.unsubscribe();
      }
      writeTeam(null);
      setSubscribedTeam(null);
    } finally {
      setBusy(false);
    }
  }, []);

  const sendTest = useCallback(async () => {
    setBusy(true);
    setMessage(null);
    try {
      const sub = await (await registration())?.pushManager.getSubscription();
      if (!sub) throw new Error("Meldingen staan niet aan");
      await postJson("/api/push", "POST", { action: "test", endpoint: sub.endpoint });
      setMessage("Testmelding verstuurd.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Testmelding mislukt");
    } finally {
      setBusy(false);
    }
  }, []);

  return { status, subscribedTeam, busy, message, enable, disable, sendTest };
}
