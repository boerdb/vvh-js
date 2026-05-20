"use client";

import Image from "next/image";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { MatchCard } from "@/components/matches/MatchCard";
import { InternationalMatchCard } from "@/components/matches/InternationalMatchCard";
import { PageLoader } from "@/components/layout/PageLoader";
import { useMenu } from "@/components/layout/AppShell";
import { getProgramma } from "@/lib/api/nevobo";
import {
  getNationsLeagueUpcoming,
  type InternationalMatch,
} from "@/lib/api/thesportsdb";
import { getLocatieLabel, toDate } from "@/lib/parsers/rss-xml";
import type { FeedItem } from "@/lib/types/models";

interface HomeMatch extends FeedItem {
  locatieTekst: "Thuis" | "Uit";
}

type HomeView = "club" | "vnl" | "empty";

export default function HomePage() {
  const { openMenu } = useMenu();
  const [matches, setMatches] = useState<HomeMatch[]>([]);
  const [vnlMatches, setVnlMatches] = useState<InternationalMatch[]>([]);
  const [view, setView] = useState<HomeView>("club");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [programmaResult, vnlResult] = await Promise.allSettled([
          getProgramma(),
          getNationsLeagueUpcoming(3),
        ]);

        if (!active) return;

        const allMatches =
          programmaResult.status === "fulfilled" ? programmaResult.value : [];

        if (programmaResult.status === "rejected") {
          console.error(programmaResult.reason);
        }

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

        if (upcoming.length > 0) {
          setMatches(
            upcoming.slice(0, 3).map((m) => ({
              ...m,
              locatieTekst: getLocatieLabel(m.titel),
            }))
          );
          setVnlMatches([]);
          setView("club");
          return;
        }

        setMatches([]);
        const vnl =
          vnlResult.status === "fulfilled" ? vnlResult.value : [];
        if (vnlResult.status === "rejected") {
          console.error(vnlResult.reason);
        }
        setVnlMatches(vnl);
        setView(vnl.length > 0 ? "vnl" : "empty");
      } catch (err) {
        console.error(err);
        if (active) {
          setMatches([]);
          setVnlMatches([]);
          setView("empty");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
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
        <h2>
          {view === "vnl"
            ? "Internationaal volleybal — Nations League"
            : "Komende wedstrijden (thuis en uit)"}
        </h2>
        {view === "vnl" && !loading && (
          <p className="page-subtitle">
            Geen VVH-wedstrijden gepland; hieronder komende Nations League-wedstrijden.
          </p>
        )}
        {loading ? (
          <PageLoader message="Wedstrijden laden..." />
        ) : (
          <div className="cards-list">
            {view === "club" &&
              matches.map((match, i) => (
                <MatchCard
                  key={match.link || `${match.titel}-${i}`}
                  item={match}
                  locatieLabel={match.locatieTekst}
                />
              ))}
            {view === "vnl" &&
              vnlMatches.map((match) => (
                <InternationalMatchCard key={match.idEvent} match={match} />
              ))}
            {view === "empty" && (
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
