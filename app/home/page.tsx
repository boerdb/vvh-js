"use client";

import Image from "next/image";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { MatchCard } from "@/components/matches/MatchCard";
import { PageLoader } from "@/components/layout/PageLoader";
import { useMenu } from "@/components/layout/AppShell";
import { getProgramma } from "@/lib/api/nevobo";
import { getLocatieLabel, toDate } from "@/lib/parsers/rss-xml";
import type { FeedItem } from "@/lib/types/models";

interface HomeMatch extends FeedItem {
  locatieTekst: "Thuis" | "Uit";
}

export default function HomePage() {
  const { openMenu } = useMenu();
  const [matches, setMatches] = useState<HomeMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProgramma()
      .then((allMatches) => {
        const now = new Date();
        const sorted = [...allMatches]
          .map((match) => ({ ...match, datumObj: toDate(match.datum) }))
          .filter((m) => m.datumObj)
          .sort(
            (a, b) => a.datumObj!.getTime() - b.datumObj!.getTime()
          );

        const upcoming = sorted.filter(
          (m) => m.datumObj!.getTime() >= now.getTime() - 86400000
        );

        const picked =
          upcoming.length >= 3 ? upcoming.slice(0, 3) : sorted.slice(0, 3);

        setMatches(
          picked.map((m) => ({
            ...m,
            locatieTekst: getLocatieLabel(m.titel),
          }))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home-page">
      <section className="hero">
        <button
          type="button"
          className="hero-menu-btn"
          onClick={openMenu}
          aria-label="Menu openen"
        >
          <Menu size={24} />
        </button>
        <div className="hero-overlay">
          <Image
            src="/logo-vvh.png"
            alt="VVH Harlingen"
            width={280}
            height={100}
            className="hero-logo"
            priority
          />
          <p className="hero-kicker">Sinds 1971</p>
          <h1>Welkom bij VVH</h1>
          <p className="hero-subtitle">
            Meer dan volleybal: een club voor sport, groei en plezier.
          </p>
        </div>
      </section>

      <section className="upcoming">
        <h2>Komende wedstrijden (thuis en uit)</h2>
        {loading ? (
          <PageLoader message="Wedstrijden laden..." />
        ) : (
          <div className="cards-list">
            {matches.map((match, i) => (
              <MatchCard
                key={match.link || `${match.titel}-${i}`}
                item={match}
                locatieLabel={match.locatieTekst}
              />
            ))}
            {matches.length === 0 && (
              <p className="empty-state">
                Geen geplande wedstrijden binnenkort.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
