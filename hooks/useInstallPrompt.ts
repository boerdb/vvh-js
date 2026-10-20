"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useSessionFlag } from "@/hooks/useSessionFlag";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_ANDROID = "vvh-dismiss-android-install";
const DISMISS_IOS = "vvh-dismiss-ios-install";

const subscribeNever = () => () => {};

export function useInstallPrompt() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  // Op de server en tijdens hydration false; daarna de echte browserwaarde.
  const isIosBrowser = useSyncExternalStore(
    subscribeNever,
    shouldShowIosInstallHint,
    () => false
  );
  const [installed, setInstalled] = useState(false);
  const [dismissAndroid, dismissAndroidBanner] = useSessionFlag(DISMISS_ANDROID);
  const [dismissIos, dismissIosBanner] = useSessionFlag(DISMISS_IOS);

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setInstallPrompt(null);
      setInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const installApp = useCallback(async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallPrompt(null);
  }, [installPrompt]);

  const showAndroidInstallBanner = !!installPrompt && !dismissAndroid;
  const showIosInstallBanner =
    isIosBrowser && !installed && !installPrompt && !dismissIos;

  return {
    showAndroidInstallBanner,
    showIosInstallBanner,
    installApp,
    dismissAndroidBanner,
    dismissIosBanner,
  };
}

function shouldShowIosInstallHint(): boolean {
  const nav = window.navigator;
  const ua = nav.userAgent.toLowerCase();
  const isIOS =
    /iphone|ipad|ipod/.test(ua) ||
    (nav.platform === "MacIntel" && nav.maxTouchPoints > 1);
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in nav &&
      Boolean((nav as Navigator & { standalone?: boolean }).standalone));
  return isIOS && !isStandalone;
}
