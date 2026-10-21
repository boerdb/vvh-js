"use client";

import { useState, useSyncExternalStore } from "react";
import { CalendarSync, Check, ChevronDown, Copy } from "lucide-react";
import { getTeamLabel } from "@/lib/constants/teams";

const subscribeNever = () => () => {};

function isApple(): boolean {
  const nav = window.navigator;
  return (
    /iphone|ipad|ipod|macintosh/i.test(nav.userAgent) ||
    (nav.platform === "MacIntel" && nav.maxTouchPoints > 1)
  );
}

/** Agenda-abonnement per team, met uitleg in gewone taal per toestel. */
export function AgendaSubscribe({ team }: { team: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  // Server/hydration: productiehost; daarna de echte (ook localhost tijdens testen).
  const host = useSyncExternalStore(subscribeNever, () => window.location.host, () => "vvh.clvs.nl");
  const apple = useSyncExternalStore(subscribeNever, isApple, () => true);

  const label = getTeamLabel(team);
  const path = `/api/agenda?team=${team}`;
  // Een echte link (geen JavaScript): iOS opent het abonneerscherm dan bij de eerste tik.
  const webcalUrl = `webcal://${host}${path}`;
  const httpsUrl = `https://${host}${path}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(httpsUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Kopieer deze link:", httpsUrl);
    }
  };

  return (
    <div className="agenda-subscribe-box">
      <button
        type="button"
        className="agenda-subscribe"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="agenda-subscribe-panel"
      >
        <CalendarSync size={16} aria-hidden />
        Alle wedstrijden van {label} in je agenda
        <ChevronDown size={16} aria-hidden className={open ? "rotated" : undefined} />
      </button>

      {open && (
        <div id="agenda-subscribe-panel" className="agenda-panel">
          <p>
            Alle wedstrijden van {label} komen in je agenda. Verandert er een
            aanvangstijd, dan past je agenda zich vanzelf aan.
          </p>

          {apple ? (
            <ol>
              <li>
                Tik hieronder op <strong>Open in Agenda</strong>.
              </li>
              <li>
                In het scherm dat opent staat de link al ingevuld: tik op{" "}
                <strong>Zoek</strong>.
              </li>
              <li>
                Tik op <strong>Abonneer</strong> en daarna rechtsboven op{" "}
                <strong>Voeg toe</strong>.
              </li>
            </ol>
          ) : (
            <ol>
              <li>
                Tik hieronder op <strong>Link kopiëren</strong>.
              </li>
              <li>
                Open <strong>calendar.google.com</strong> in je browser (dat kan niet in
                de Google Agenda-app).
              </li>
              <li>
                Kies naast <strong>Andere agenda&apos;s</strong> het plusje →{" "}
                <strong>Via URL</strong>, plak de link en tik op{" "}
                <strong>Agenda toevoegen</strong>.
              </li>
            </ol>
          )}

          <div className="match-card-actions">
            <a href={webcalUrl} className="match-card-btn">
              Open in Agenda
            </a>
            <button type="button" className="match-card-btn secondary" onClick={copy}>
              {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
              {copied ? "Gekopieerd" : "Link kopiëren"}
            </button>
          </div>

          <p className="agenda-panel-hint">
            Liever één wedstrijd? Gebruik dan <strong>In agenda</strong> bij die wedstrijd.
          </p>
        </div>
      )}
    </div>
  );
}
