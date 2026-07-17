"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PageLoader } from "@/components/layout/PageLoader";
import { StandingsTable } from "@/components/standings/StandingsTable";
import { NevoboTeamEmptyState } from "@/components/team/NevoboTeamEmptyState";
import { getStanden } from "@/lib/api/team";
import { getTeamLabel } from "@/lib/constants/teams";
import type { StandenResult } from "@/lib/types/models";

function TeamStandenContent({ code }: { code: string }) {
  const [result, setResult] = useState<StandenResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getStanden(code)
      .then((data) => {
        if (active) setResult(data);
      })
      .catch(console.error)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [code]);

  if (loading) return <PageLoader message="Standen laden..." />;
  if (!result) return <p className="empty-state">Kon standen niet laden.</p>;

  const hasStandRows = result.standen.some((row) => !row.isDivider);
  if (!hasStandRows) {
    return (
      <>
        <h1 className="page-title">Stand {code}</h1>
        <p className="page-subtitle">{getTeamLabel(code)}</p>
        <NevoboTeamEmptyState teamCode={code} kind="standen" />
      </>
    );
  }

  return <StandingsTable teamCode={code} result={result} />;
}

export default function TeamStandenPage() {
  const params = useParams();
  const code = String(params.code || "").toUpperCase();

  return (
    <div className="page-container" style={{ paddingTop: "0.5rem" }}>
      {code ? <TeamStandenContent key={code} code={code} /> : null}
    </div>
  );
}
