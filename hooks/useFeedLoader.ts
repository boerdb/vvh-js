"use client";

import { useCallback, useEffect, useState } from "react";

export function useFeedLoader<T>(loader: () => Promise<T>, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);

  const run = useCallback(
    async (showLoader: boolean) => {
      if (showLoader) setLoading(true);
      try {
        setData(await loader());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [loader]
  );

  useEffect(() => {
    void run(true);
  }, [run]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") void run(false);
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [run]);

  return { data, loading };
}
