"use client";

import { useCallback, useEffect, useState } from "react";
import { useSessionFlag } from "@/hooks/useSessionFlag";

const DISMISS_UPDATE = "vvh-dismiss-update";

export function usePwaUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [dismissUpdate, dismissUpdateBanner] = useSessionFlag(DISMISS_UPDATE);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const onControllerChange = () => {
      window.location.reload();
    };

    const checkWaiting = (registration: ServiceWorkerRegistration) => {
      if (registration.waiting) {
        setUpdateAvailable(true);
      }
    };

    navigator.serviceWorker.ready.then((registration) => {
      checkWaiting(registration);

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            setUpdateAvailable(true);
          }
        });
      });
    });

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange
    );

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange
      );
    };
  }, []);

  const applyUpdate = useCallback(() => {
    navigator.serviceWorker.ready.then((registration) => {
      registration.waiting?.postMessage({ type: "SKIP_WAITING" });
    });
    setUpdateAvailable(false);
  }, []);

  const showUpdateBanner = updateAvailable && !dismissUpdate;

  return { showUpdateBanner, applyUpdate, dismissUpdateBanner };
}
