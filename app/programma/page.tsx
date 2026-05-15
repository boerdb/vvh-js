"use client";

import { useEffect, useState } from "react";
import { MatchCard } from "@/components/matches/MatchCard";
import { PageLoader } from "@/components/layout/PageLoader";
import { getProgramma } from "@/lib/api/nevobo";
import type { FeedItem } from "@/lib/types/models";

export default function ProgrammaPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProgramma()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container">
      <h1 className="page-title">Programma</h1>
      <p className="page-subtitle">Alle geplande wedstrijden</p>
      {loading ? (
        <PageLoader message="Programma laden..." />
      ) : (
        <div className="cards-list">
          {items.map((item, i) => (
            <MatchCard key={item.link || `${item.titel}-${i}`} item={item} />
          ))}
          {items.length === 0 && (
            <p className="empty-state">Geen wedstrijden gevonden.</p>
          )}
        </div>
      )}
    </div>
  );
}
