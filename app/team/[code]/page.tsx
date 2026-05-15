"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MatchCard } from "@/components/matches/MatchCard";
import { PageLoader } from "@/components/layout/PageLoader";
import { getTeamResultaten } from "@/lib/api/team";
import { getTeamLabel } from "@/lib/constants/teams";
import type { FeedItem } from "@/lib/types/models";

function TeamResultatenContent({ code }: { code: string }) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getTeamResultaten(code)
      .then((data) => {
        if (active) setItems(data);
      })
      .catch(console.error)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [code]);

  return (
    <>
      <h1 className="page-title">Uitslagen {code}</h1>
      <p className="page-subtitle">{getTeamLabel(code)}</p>
      {loading ? (
        <PageLoader message="Uitslagen laden..." />
      ) : (
        <div className="cards-list">
          {items.map((item, i) => (
            <MatchCard key={item.link || `${item.titel}-${i}`} item={item} />
          ))}
          {items.length === 0 && (
            <p className="empty-state">Geen uitslagen gevonden.</p>
          )}
        </div>
      )}
    </>
  );
}

export default function TeamResultatenPage() {
  const params = useParams();
  const code = String(params.code || "").toUpperCase();

  return (
    <div className="page-container">
      {code ? <TeamResultatenContent key={code} code={code} /> : null}
    </div>
  );
}
