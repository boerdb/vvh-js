"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useCallback } from "react";
import { MatchCard } from "@/components/matches/MatchCard";
import { InternationalMatchCard } from "@/components/matches/InternationalMatchCard";
import { ErrorState } from "@/components/layout/ErrorState";
import { PageLoader } from "@/components/layout/PageLoader";
import { StaleNotice } from "@/components/layout/StaleNotice";
import { useMenu } from "@/components/layout/AppShell";
import { getFetchedAt } from "@/lib/api/fetch-api";
import { getProgramma } from "@/lib/api/nevobo";
import {
  getNationsLeagueUpcoming,
  type InternationalMatch,
} from "@/lib/api/thesportsdb";
import { getTeamLabel } from "@/lib/constants/teams";
import { matchesVvhTeam, toDate } from "@/lib/parsers/rss-xml";
import type { FeedItem } from "@/lib/types/models";
import { useFeedLoader } from "@/hooks/useFeedLoader";
import { useMyTeam } from "@/hooks/useMyTeam";

const HOME_MATCH_COUNT = 3;
const DAY_MS = 86_400_000;

type HomeView =
  | { view: "club"; matches: FeedItem[]; team: string | null }
  | { view: "vnl"; matches: InternationalMatch[] }
  | { view: "empty" };

/** fetchedAt: leeftijd van het clubprogramma, voor StaleNotice. */
type HomeData = HomeView & { fetchedAt: Date | null };

function upcomingMatches(items: FeedItem[]): FeedItem[] {
  const since = Date.now() - DAY_MS;
  return items
    .map((item) => ({ item, time: toDate(item.datum)?.getTime() ?? NaN }))
    .filter(({ time }) => time >= since)
    .sort((a, b) => a.time - b.time)
    .map(({ item }) => item);
}

async function loadHome(myTeam: string | null): Promise<HomeData> {
  const programma = await getProgramma();
  const upcoming = upcomingMatches(programma);
  const own = myTeam
    ? upcoming.filter((item) => matchesVvhTeam(item, myTeam))
    : [];

  let data: HomeView;
  if (own.length > 0) {
    data = { view: "club", matches: own.slice(0, HOME_MATCH_COUNT), team: myTeam };
  } else if (upcoming.length > 0) {
    data = { view: "club", matches: upcoming.slice(0, HOME_MATCH_COUNT), team: null };
  } else {
    // Alleen buiten het seizoen: dan de Nations League als opvulling.
    const vnl = await getNationsLeagueUpcoming(HOME_MATCH_COUNT).catch(
      (error: unknown) => {
        console.error(error);
        return [];
      }
    );
    data = vnl.length > 0 ? { view: "vnl", matches: vnl } : { view: "empty" };
  }

  return { ...data, fetchedAt: getFetchedAt(programma) };
}

function homeTitle(data: HomeData | null): string {
  if (data?.view === "vnl") return "Internationaal volleybal — Nations League";
  if (data?.view === "club" && data.team) {
    return `Komende wedstrijden van ${getTeamLabel(data.team)}`;
  }
  return "Komende wedstrijden (thuis en uit)";
}

export default function HomePage() {
  const { openMenu } = useMenu();
  const { myTeam } = useMyTeam();
  const loader = useCallback(() => loadHome(myTeam), [myTeam]);
  const { data, loading, error, reload } = useFeedLoader<HomeData | null>(
    loader,
    null
  );

  return (
    <div className="home-page">
      <section className="hero">
        <button
          type="button"
          className="hero-menu-btn"
          onClick={openMenu}
          aria-label="Menu openen"
          suppressHydrationWarning
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
        <h2>{homeTitle(data)}</h2>
        {data?.view === "vnl" && !loading && (
          <p className="page-subtitle">
            Geen VVH-wedstrijden gepland; hieronder komende Nations League-wedstrijden.
          </p>
        )}
        {!myTeam && data?.view === "club" && (
          <p className="page-subtitle">
            Tip: tik op de ster naast het teamfilter bij{" "}
            <Link href="/programma">Programma</Link> om je eigen team hier te
            zien.
          </p>
        )}
        <StaleNotice fetchedAt={data?.fetchedAt ?? null} />
        {loading ? (
          <PageLoader message="Wedstrijden laden..." />
        ) : error || !data ? (
          <ErrorState message="Kon de wedstrijden niet laden." onRetry={reload} />
        ) : (
          <div className="cards-list">
            {data.view === "club" &&
              data.matches.map((match, i) => (
                <MatchCard key={match.link || `${match.titel}-${i}`} item={match} />
              ))}
            {data.view === "club" && data.team && (
              <Link href="/programma?team=ALL" className="home-all-link">
                Alle clubwedstrijden bekijken
              </Link>
            )}
            {data.view === "vnl" &&
              data.matches.map((match) => (
                <InternationalMatchCard key={match.idEvent} match={match} />
              ))}
            {data.view === "empty" && (
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
