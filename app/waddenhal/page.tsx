"use client";

import { Suspense, useCallback, useMemo } from "react";
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

function isGeplandInWaddenhal(item: FeedItem): boolean {
  const t = (item.titel || "").toLowerCase();
  const o = (item.omschrijving || "").toLowerCase();
  if (!t.includes("waddenhal") && !o.includes("waddenhal")) return false;
  return !parseMatch(item)?.uitslag;
}

function WaddenhalContent() {
  const loader = useCallback(() => getProgramma(), []);
  const { data: items, loading, error, reload, fetchedAt } =
    useFeedLoader<FeedItem[]>(loader, []);
  const { teamFilter, setTeamFilter } = useTeamFilter({
    teams: VVH_WEDSTRIJD_TEAMS,
  });

  const filtered = useMemo(() => {
    const thuis = items.filter(isGeplandInWaddenhal);
    if (teamFilter === ALL_TEAMS) return thuis;
    return thuis.filter((item) => matchesVvhTeam(item, teamFilter));
  }, [items, teamFilter]);

  const selectedLabel =
    teamFilter === ALL_TEAMS
      ? "Wedstrijden in de Waddenhal"
      : `${getTeamLabel(teamFilter)} in de Waddenhal`;

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Thuis Wedstrijden</h1>
          <p className="page-subtitle">{selectedLabel}</p>
        </div>
        <TeamFilter
          value={teamFilter}
          onChange={setTeamFilter}
          teams={VVH_WEDSTRIJD_TEAMS}
        />
      </div>
      <StaleNotice fetchedAt={fetchedAt} />
      {loading ? (
        <PageLoader message="Wedstrijden laden..." />
      ) : error ? (
        <ErrorState message="Kon de thuiswedstrijden niet laden." onRetry={reload} />
      ) : (
        <MatchList
          items={filtered}
          emptyText={
            teamFilter === ALL_TEAMS
              ? "Er zijn momenteel geen wedstrijden in de Waddenhal."
              : "Geen thuiswedstrijden gevonden voor dit team."
          }
        />
      )}
    </div>
  );
}

export default function WaddenhalPage() {
  return (
    <Suspense fallback={<PageLoader message="Wedstrijden laden..." />}>
      <WaddenhalContent />
    </Suspense>
  );
}
