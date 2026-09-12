"use client";

import { Suspense, useCallback, useMemo } from "react";
import { MatchCard } from "@/components/matches/MatchCard";
import { PageLoader } from "@/components/layout/PageLoader";
import { TeamFilter } from "@/components/layout/TeamFilter";
import { getProgramma } from "@/lib/api/nevobo";
import { getTeamLabel } from "@/lib/constants/teams";
import { matchesVvhTeam } from "@/lib/parsers/rss-xml";
import type { FeedItem } from "@/lib/types/models";
import { useFeedLoader } from "@/hooks/useFeedLoader";
import { ALL_TEAMS, useTeamFilter } from "@/hooks/useTeamFilter";

function isWaddenhalMatch(item: FeedItem): boolean {
  const t = (item.titel || "").toLowerCase();
  const o = (item.omschrijving || "").toLowerCase();
  return t.includes("waddenhal") || o.includes("waddenhal");
}

function WaddenhalContent() {
  const loader = useCallback(
    () => getProgramma().then((all) => all.filter(isWaddenhalMatch)),
    []
  );
  const { data: items, loading } = useFeedLoader<FeedItem[]>(loader, []);
  const { teamFilter, setTeamFilter } = useTeamFilter();

  const filtered = useMemo(() => {
    if (teamFilter === ALL_TEAMS) return items;
    return items.filter((item) => matchesVvhTeam(item, teamFilter));
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
        <TeamFilter value={teamFilter} onChange={setTeamFilter} />
      </div>
      {loading ? (
        <PageLoader message="Wedstrijden laden..." />
      ) : (
        <div className="cards-list">
          {filtered.map((item, i) => (
            <MatchCard key={item.link || `${item.titel}-${i}`} item={item} />
          ))}
          {filtered.length === 0 && (
            <p className="empty-state">
              {teamFilter === ALL_TEAMS
                ? "Er zijn momenteel geen wedstrijden in de Waddenhal."
                : "Geen thuiswedstrijden gevonden voor dit team."}
            </p>
          )}
        </div>
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
