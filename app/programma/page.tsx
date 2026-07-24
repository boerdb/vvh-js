"use client";

import { useEffect, useMemo, useState } from "react";
import { MatchCard } from "@/components/matches/MatchCard";
import { PageLoader } from "@/components/layout/PageLoader";
import { getProgramma } from "@/lib/api/nevobo";
import { VVH_TEAMS } from "@/lib/constants/teams";
import { matchesVvhTeam } from "@/lib/parsers/rss-xml";
import type { FeedItem } from "@/lib/types/models";

const ALL_TEAMS = "ALL";

export default function ProgrammaPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamFilter, setTeamFilter] = useState(ALL_TEAMS);

  useEffect(() => {
    getProgramma()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (teamFilter === ALL_TEAMS) return items;
    return items.filter((item) => matchesVvhTeam(item, teamFilter));
  }, [items, teamFilter]);

  const selectedLabel =
    teamFilter === ALL_TEAMS
      ? "Alle geplande wedstrijden"
      : `Wedstrijden van ${VVH_TEAMS.find((t) => t.code === teamFilter)?.label ?? teamFilter}`;

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Programma</h1>
          <p className="page-subtitle">{selectedLabel}</p>
        </div>
        <label className="team-filter">
          <span className="team-filter-label">Team</span>
          <select
            className="team-filter-select"
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            aria-label="Filter op team"
          >
            <option value={ALL_TEAMS}>Alle teams</option>
            {VVH_TEAMS.map((team) => (
              <option key={team.code} value={team.code}>
                {team.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {loading ? (
        <PageLoader message="Programma laden..." />
      ) : (
        <div className="cards-list">
          {filtered.map((item, i) => (
            <MatchCard key={item.link || `${item.titel}-${i}`} item={item} />
          ))}
          {filtered.length === 0 && (
            <p className="empty-state">
              {teamFilter === ALL_TEAMS
                ? "Geen wedstrijden gevonden."
                : "Geen wedstrijden gevonden voor dit team."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
