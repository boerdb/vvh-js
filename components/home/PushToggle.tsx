"use client";

import { Bell, BellOff, BellRing } from "lucide-react";
import { getTeamLabel } from "@/lib/constants/teams";
import { useEffect } from "react";
import { followMyTeamWithPush, usePushSubscription } from "@/hooks/usePushSubscription";

/** Meldingen voor Mijn team: nieuwe uitslag, andere aanvangstijd, vervallen. */
export function PushToggle({ team }: { team: string }) {
  const { status, subscribedTeam, busy, message, enable, disable, sendTest } =
    usePushSubscription();
  const label = getTeamLabel(team);

  // Bestaande abonnementen op een oud team (van vóór "meldingen volgen Mijn team")
  // gaan vanzelf mee zodra Home opent.
  useEffect(() => {
    if (status === "ready" && subscribedTeam && subscribedTeam !== team) {
      void followMyTeamWithPush(team);
    }
  }, [status, subscribedTeam, team]);

  if (status === "loading" || status === "unavailable" || status === "unsupported") {
    return null;
  }

  return (
    <div className="push-card">
      <div className="push-card-text">
        <strong>
          {subscribedTeam ? <BellRing size={18} aria-hidden /> : <Bell size={18} aria-hidden />}
          Meldingen
        </strong>
        {status === "ios-install" ? (
          <span>
            Zet de app op je beginscherm (Deel → Zet op beginscherm) om meldingen voor{" "}
            {label} te krijgen.
          </span>
        ) : status === "denied" ? (
          <span>
            Meldingen zijn geblokkeerd. Zet ze aan bij de instellingen van je telefoon of
            browser.
          </span>
        ) : subscribedTeam === team ? (
          <span>Aan voor {label}: uitslagen, nieuwe aanvangstijden en afgelaste wedstrijden.</span>
        ) : subscribedTeam ? (
          <span>Nu aan voor {getTeamLabel(subscribedTeam)}.</span>
        ) : (
          <span>Krijg een melding bij een uitslag of wijziging van {label}.</span>
        )}
        {message && (
          <span className="push-card-message" role="status">
            {message}
          </span>
        )}
      </div>

      {status === "ready" && (
        <div className="push-card-actions">
          {subscribedTeam === team ? (
            <>
              <button type="button" className="match-card-btn secondary" onClick={sendTest} disabled={busy}>
                Testmelding
              </button>
              <button type="button" className="match-card-btn secondary" onClick={disable} disabled={busy}>
                <BellOff size={16} aria-hidden /> Uit
              </button>
            </>
          ) : (
            <button type="button" className="match-card-btn" onClick={() => enable(team)} disabled={busy}>
              {subscribedTeam ? `Omzetten naar ${label}` : "Meldingen aan"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
