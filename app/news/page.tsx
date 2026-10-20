"use client";

import { NewsCard } from "@/components/news/NewsCard";
import { ErrorState } from "@/components/layout/ErrorState";
import { PageLoader } from "@/components/layout/PageLoader";
import { getNews } from "@/lib/api/news";
import type { NewsItem } from "@/lib/types/models";
import { useFeedLoader } from "@/hooks/useFeedLoader";

export default function NewsPage() {
  const { data: items, loading, error, reload } = useFeedLoader<NewsItem[]>(
    getNews,
    []
  );

  return (
    <div className="page-container">
      <h1 className="page-title">Clubnieuws</h1>
      <p className="page-subtitle">Laatste berichten van VVH Harlingen</p>
      {loading ? (
        <PageLoader message="Nieuws laden..." />
      ) : error ? (
        <ErrorState message="Kon het clubnieuws niet laden." onRetry={reload} />
      ) : (
        <div className="cards-list">
          {items.map((item, i) => (
            <NewsCard key={item.link || `${item.titel}-${i}`} item={item} />
          ))}
          {items.length === 0 && (
            <p className="empty-state">Geen nieuwsberichten gevonden.</p>
          )}
        </div>
      )}
    </div>
  );
}
