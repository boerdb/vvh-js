"use client";

import { Suspense, useCallback, useMemo } from "react";
import { MatchCard } from "@/components/matches/MatchCard";
import { PageLoader } from "@/components/layout/PageLoader";
import { TeamFilter } from "@/components/layout/TeamFilter";
import { getResultaten } from "@/lib/api/nevobo";
import { getTeamLabel, VVH_UITSLAGEN_TEAMS } from "@/lib/constants/teams";
import { matchesVvhTeam } from "@/lib/parsers/rss-xml";
import type { FeedItem } from "@/lib/types/models";
import { useFeedLoader } from "@/hooks/useFeedLoader";
import { ALL_TEAMS, useTeamFilter } from "@/hooks/useTeamFilter";

function UitslagenContent() {
  const loader = useCallback(() => getResultaten(), []);
  const { data: items, loading } = useFeedLoader<FeedItem[]>(loader, []);
  const { teamFilter, setTeamFilter } = useTeamFilter({
    teams: VVH_UITSLAGEN_TEAMS,
  });

  const filtered = useMemo(() => {
    if (teamFilter === ALL_TEAMS) return items;
    return items.filter((item) => matchesVvhTeam(item, teamFilter));
  }, [items, teamFilter]);

  const selectedLabel =
    teamFilter === ALL_TEAMS
      ? "Alle recente uitslagen"
      : `Uitslagen van ${getTeamLabel(teamFilter)}`;

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Uitslagen</h1>
          <p className="page-subtitle">{selectedLabel}</p>
        </div>
        <TeamFilter
          value={teamFilter}
          onChange={setTeamFilter}
          teams={VVH_UITSLAGEN_TEAMS}
        />
      </div>
      {loading ? (
        <PageLoader message="Uitslagen laden..." />
      ) : (
        <div className="cards-list">
          {filtered.map((item, i) => (
            <MatchCard key={item.link || `${item.titel}-${i}`} item={item} />
          ))}
          {filtered.length === 0 && (
            <p className="empty-state">
              {teamFilter === ALL_TEAMS
                ? "Geen uitslagen gevonden."
                : "Geen uitslagen gevonden voor dit team."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function TeamsPage() {
  return (
    <Suspense fallback={<PageLoader message="Uitslagen laden..." />}>
      <UitslagenContent />
    </Suspense>
  );
}
