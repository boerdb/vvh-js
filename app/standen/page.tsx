"use client";

import { Suspense, useCallback } from "react";
import { PageLoader } from "@/components/layout/PageLoader";
import { TeamFilter } from "@/components/layout/TeamFilter";
import { StandingsTable } from "@/components/standings/StandingsTable";
import { getStanden } from "@/lib/api/team";
import { getTeamLabel } from "@/lib/constants/teams";
import type { StandenResult } from "@/lib/types/models";
import { useFeedLoader } from "@/hooks/useFeedLoader";
import { useTeamFilter } from "@/hooks/useTeamFilter";

function StandenContent() {
  const { teamFilter, setTeamFilter } = useTeamFilter({ allowAll: false });
  const loader = useCallback(() => getStanden(teamFilter), [teamFilter]);
  const { data: result, loading } = useFeedLoader<StandenResult | null>(
    loader,
    null
  );

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Standen</h1>
          <p className="page-subtitle">Stand van {getTeamLabel(teamFilter)}</p>
        </div>
        <TeamFilter
          value={teamFilter}
          onChange={setTeamFilter}
          includeAll={false}
        />
      </div>
      {loading ? (
        <PageLoader message="Standen laden..." />
      ) : !result ? (
        <p className="empty-state">Kon standen niet laden.</p>
      ) : (
        <StandingsTable
          key={teamFilter}
          teamCode={teamFilter}
          result={result}
          hideHeading
        />
      )}
    </div>
  );
}

export default function StandenPage() {
  return (
    <Suspense fallback={<PageLoader message="Standen laden..." />}>
      <StandenContent />
    </Suspense>
  );
}
