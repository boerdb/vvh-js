"use client";

import { format, isToday } from "date-fns";
import { nl } from "date-fns/locale";
import { CloudOff } from "lucide-react";
import { useState } from "react";

/** Vanaf deze leeftijd komt de data vrijwel zeker uit de offline-cache. */
const STALE_AFTER_MS = 10 * 60_000;

export function StaleNotice({ fetchedAt }: { fetchedAt: Date | null }) {
  const [mountedAt] = useState(() => Date.now());
  if (!fetchedAt || mountedAt - fetchedAt.getTime() < STALE_AFTER_MS) {
    return null;
  }

  const when = format(fetchedAt, isToday(fetchedAt) ? "HH:mm" : "EEEE d MMM HH:mm", {
    locale: nl,
  });

  return (
    <p className="stale-notice" role="status">
      <CloudOff size={16} aria-hidden />
      <span>
        Geen verbinding? Je ziet opgeslagen gegevens van {when}.
      </span>
    </p>
  );
}
