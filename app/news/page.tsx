"use client";

import { useEffect, useState } from "react";
import { NewsCard } from "@/components/news/NewsCard";
import { PageLoader } from "@/components/layout/PageLoader";
import { getNews } from "@/lib/api/news";
import type { NewsItem } from "@/lib/types/models";

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNews()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container">
      <h1 className="page-title">Clubnieuws</h1>
      <p className="page-subtitle">Laatste berichten van VVH Harlingen</p>
      {loading ? (
        <PageLoader message="Nieuws laden..." />
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
