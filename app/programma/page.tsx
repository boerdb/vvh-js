"use client";

import { Suspense, useCallback, useMemo } from "react";
import { CalendarSync } from "lucide-react";
import { MatchList } from "@/components/matches/MatchList";
import { ErrorState } from "@/components/layout/ErrorState";
import { PageLoader } from "@/components/layout/PageLoader";
import { StaleNotice } from "@/components/layout/StaleNotice";
import { TeamFilter } from "@/components/layout/TeamFilter";
import { getProgramma } from "@/lib/api/nevobo";
import { getTeamLabel, VVH_WEDSTRIJD_TEAMS } from "@/lib/constants/teams";
import { parseMatch } from "@/lib/parsers/match";
import { matchesVvhTeam } from "@/lib/parsers/rss-xml";
import type { FeedItem } from "@/lib/types/models";
import { useFeedLoader } from "@/hooks/useFeedLoader";
import { ALL_TEAMS, useTeamFilter } from "@/hooks/useTeamFilter";

function isGepland(item: FeedItem): boolean {
  return !parseMatch(item)?.uitslag;
}

function ProgrammaContent() {
  const loader = useCallback(() => getProgramma(), []);
  const { data: items, loading, error, reload, fetchedAt } =
    useFeedLoader<FeedItem[]>(loader, []);
  const { teamFilter, setTeamFilter } = useTeamFilter({
    teams: VVH_WEDSTRIJD_TEAMS,
  });

  const filtered = useMemo(() => {
    const gepland = items.filter(isGepland);
    if (teamFilter === ALL_TEAMS) return gepland;
    return gepland.filter((item) => matchesVvhTeam(item, teamFilter));
  }, [items, teamFilter]);

  const selectedLabel =
    teamFilter === ALL_TEAMS
      ? "Alle geplande wedstrijden"
      : `Wedstrijden van ${getTeamLabel(teamFilter)}`;

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Programma</h1>
          <p className="page-subtitle">{selectedLabel}</p>
        </div>
        <TeamFilter
          value={teamFilter}
          onChange={setTeamFilter}
          teams={VVH_WEDSTRIJD_TEAMS}
        />
      </div>
      {teamFilter !== ALL_TEAMS && (
        <a
          className="agenda-subscribe"
          href={`/api/agenda?team=${teamFilter}`}
          onClick={(event) => {
            // webcal:// laat de agenda-app een abonnement maken i.p.v. eenmalig importeren.
            event.preventDefault();
            window.location.href = `webcal://${window.location.host}/api/agenda?team=${teamFilter}`;
          }}
        >
          <CalendarSync size={16} aria-hidden />
          Abonneer op de agenda van {getTeamLabel(teamFilter)}
        </a>
      )}
      <StaleNotice fetchedAt={fetchedAt} />
      {loading ? (
        <PageLoader message="Programma laden..." />
      ) : error ? (
        <ErrorState message="Kon het programma niet laden." onRetry={reload} />
      ) : (
        <MatchList
          items={filtered}
          emptyText={
            teamFilter === ALL_TEAMS
              ? "Geen wedstrijden gevonden."
              : "Geen wedstrijden gevonden voor dit team."
          }
        />
      )}
    </div>
  );
}

export default function ProgrammaPage() {
  return (
    <Suspense fallback={<PageLoader message="Programma laden..." />}>
      <ProgrammaContent />
    </Suspense>
  );
}
