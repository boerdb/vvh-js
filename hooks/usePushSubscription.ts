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

function writeTeam(team: string | null) {
  try {
    if (team) localStorage.setItem(TEAM_KEY, team);
    else localStorage.removeItem(TEAM_KEY);
  } catch {
    // Zonder opslag weet de app na herladen alleen niet welk team aan staat.
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
        if (active) setSubscribedTeam(sub ? readTeam() : null);
        return "ready";
      })();
      if (active) setStatus(next);
    })();
    return () => {
      active = false;
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
