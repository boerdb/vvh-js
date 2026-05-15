"use client";

import { useEffect, useState } from "react";
import { MatchCard } from "@/components/matches/MatchCard";
import { PageLoader } from "@/components/layout/PageLoader";
import { getNevoboNieuws } from "@/lib/api/nevobo";
import type { FeedItem } from "@/lib/types/models";

export default function NevoboNieuwsPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNevoboNieuws()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container">
      <h1 className="page-title">Nevobo Nieuws</h1>
      <p className="page-subtitle">Nieuws van de Nevobo</p>
      {loading ? (
        <PageLoader message="Nieuws laden..." />
      ) : (
        <div className="cards-list">
          {items.map((item, i) => (
            <MatchCard key={item.link || `${item.titel}-${i}`} item={item} />
          ))}
          {items.length === 0 && (
            <p className="empty-state">Geen nieuws gevonden.</p>
          )}
        </div>
      )}
    </div>
  );
}
