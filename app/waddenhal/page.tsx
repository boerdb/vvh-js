"use client";

import { useEffect, useState } from "react";
import { MatchCard } from "@/components/matches/MatchCard";
import { PageLoader } from "@/components/layout/PageLoader";
import { getProgramma } from "@/lib/api/nevobo";
import type { FeedItem } from "@/lib/types/models";

function isWaddenhalMatch(item: FeedItem): boolean {
  const t = (item.titel || "").toLowerCase();
  const o = (item.omschrijving || "").toLowerCase();
  return t.includes("waddenhal") || o.includes("waddenhal");
}

export default function WaddenhalPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProgramma()
      .then((all) => setItems(all.filter(isWaddenhalMatch)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container">
      <h1 className="page-title">Thuis Wedstrijden</h1>
      <p className="page-subtitle">Wedstrijden in de Waddenhal</p>
      {loading ? (
        <PageLoader message="Wedstrijden laden..." />
      ) : (
        <div className="cards-list">
          {items.map((item, i) => (
            <MatchCard key={item.link || `${item.titel}-${i}`} item={item} />
          ))}
          {items.length === 0 && (
            <p className="empty-state">
              Er zijn momenteel geen wedstrijden in de Waddenhal.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
