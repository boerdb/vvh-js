"use client";

import { MatchCard } from "@/components/matches/MatchCard";
import { ErrorState } from "@/components/layout/ErrorState";
import { PageLoader } from "@/components/layout/PageLoader";
import { getNevoboNieuws } from "@/lib/api/nevobo";
import type { FeedItem } from "@/lib/types/models";
import { useFeedLoader } from "@/hooks/useFeedLoader";

export default function NevoboNieuwsPage() {
  const { data: items, loading, error, reload } = useFeedLoader<FeedItem[]>(
    getNevoboNieuws,
    []
  );

  return (
    <div className="page-container">
      <h1 className="page-title">Nevobo Nieuws</h1>
      <p className="page-subtitle">Nieuws van de Nevobo</p>
      {loading ? (
        <PageLoader message="Nieuws laden..." />
      ) : error ? (
        <ErrorState message="Kon het Nevobo-nieuws niet laden." onRetry={reload} />
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
