"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** focus en visibilitychange vuren vaak tegelijk; upstream cachet toch 60 s. */
const MIN_REFRESH_INTERVAL_MS = 30_000;

export function useFeedLoader<T>(loader: () => Promise<T>, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const initialRef = useRef(initial);
  const requestIdRef = useRef(0);
  const lastRunRef = useRef(0);

  const run = useCallback(
    async (showLoader: boolean) => {
      const requestId = ++requestIdRef.current;
      lastRunRef.current = Date.now();
      if (showLoader) {
        // Nooit data van een vorige loader (bijv. ander team) laten staan.
        setData(initialRef.current);
        setError(null);
        setLoading(true);
      }
      try {
        const result = await loader();
        if (requestId !== requestIdRef.current) return;
        setData(result);
        setError(null);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        console.error(err);
        // Achtergrondverversing mislukt: bestaande data blijft zichtbaar.
        if (showLoader) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    },
    [loader]
  );

  useEffect(() => {
    // Elke nieuwe run maakt lopende antwoorden van een vorige loader ongeldig.
    void run(true);
  }, [run]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastRunRef.current < MIN_REFRESH_INTERVAL_MS) return;
      void run(false);
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [run]);

  const reload = useCallback(() => run(true), [run]);

  return { data, loading, error, reload };
}
