"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useCallback } from "react";
import { HomeHighlights } from "@/components/home/HomeHighlights";
import { PushToggle } from "@/components/home/PushToggle";
import { MatchCard } from "@/components/matches/MatchCard";
import { InternationalMatchCard } from "@/components/matches/InternationalMatchCard";
import { ErrorState } from "@/components/layout/ErrorState";
import { PageLoader } from "@/components/layout/PageLoader";
import { StaleNotice } from "@/components/layout/StaleNotice";
import { useMenu } from "@/components/layout/AppShell";
import { getFetchedAt } from "@/lib/api/fetch-api";
import { getProgramma, getResultaten } from "@/lib/api/nevobo";
import {
  getNationsLeagueUpcoming,
  type InternationalMatch,
} from "@/lib/api/thesportsdb";
import { getTeamLabel } from "@/lib/constants/teams";
import { parseMatch } from "@/lib/parsers/match";
import { matchesVvhTeam, toDate } from "@/lib/parsers/rss-xml";
import type { FeedItem } from "@/lib/types/models";
import { useFeedLoader } from "@/hooks/useFeedLoader";
import { useMyTeam } from "@/hooks/useMyTeam";

const HOME_MATCH_COUNT = 3;
/** Een wedstrijd die net begonnen is telt nog even als "komend". */
const IN_PROGRESS_MS = 3 * 60 * 60 * 1000;

interface HomeData {
  /** null = hele club (geen Mijn team, of daar staat niets voor). */
  team: string | null;
  next: FeedItem | null;
  lastResult: FeedItem | null;
  /** Wedstrijden na "next". */
  later: FeedItem[];
  /** Alleen buiten het seizoen, als de club niets gepland heeft. */
  vnl: InternationalMatch[];
  /** Leeftijd van het clubprogramma, voor StaleNotice. */
  fetchedAt: Date | null;
}

function upcomingMatches(items: FeedItem[]): FeedItem[] {
  const since = Date.now() - IN_PROGRESS_MS;
  return items
    .filter((item) => {
      const match = parseMatch(item);
      return !match?.uitslag && !match?.vervallen;
    })
    .map((item) => ({ item, time: toDate(item.datum)?.getTime() ?? NaN }))
    .filter(({ time }) => time >= since)
    .sort((a, b) => a.time - b.time)
    .map(({ item }) => item);
}

async function loadHome(myTeam: string | null): Promise<HomeData> {
  // Uitslagen zijn een extraatje: als die feed faalt, toont Home toch het programma.
  const [programma, resultaten] = await Promise.all([
    getProgramma(),
    getResultaten().catch((error: unknown) => {
      console.error(error);
      return [] as FeedItem[];
    }),
  ]);
  const upcoming = upcomingMatches(programma);
  const results = resultaten.filter((item) => parseMatch(item)?.uitslag);

  const ownUpcoming = myTeam ? upcoming.filter((i) => matchesVvhTeam(i, myTeam)) : [];
  const ownResults = myTeam ? results.filter((i) => matchesVvhTeam(i, myTeam)) : [];
  const useTeam = Boolean(myTeam) && (ownUpcoming.length > 0 || ownResults.length > 0);
  const scopeUpcoming = useTeam ? ownUpcoming : upcoming;
  const scopeResults = useTeam ? ownResults : results;

  const vnl =
    upcoming.length > 0
      ? []
      : await getNationsLeagueUpcoming(HOME_MATCH_COUNT).catch((error: unknown) => {
          console.error(error);
          return [];
        });

  return {
    team: useTeam ? myTeam : null,
    next: scopeUpcoming[0] ?? null,
    lastResult: scopeResults[0] ?? null,
    later: scopeUpcoming.slice(1, 1 + HOME_MATCH_COUNT),
    vnl,
    fetchedAt: getFetchedAt(programma),
  };
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
        <h2>{data?.team ? `Mijn team: ${getTeamLabel(data.team)}` : "VVH Harlingen"}</h2>
        {!myTeam && data && !loading && (
          <p className="page-subtitle">
            Tip: tik op de ster naast het teamfilter bij{" "}
            <Link href="/programma">Programma</Link> om hier je eigen team te
            zien.
          </p>
        )}
        <StaleNotice fetchedAt={data?.fetchedAt ?? null} />
        {loading ? (
          <PageLoader message="Wedstrijden laden..." count={2} />
        ) : error || !data ? (
          <ErrorState message="Kon de wedstrijden niet laden." onRetry={reload} />
        ) : (
          <>
            <HomeHighlights next={data.next} lastResult={data.lastResult} team={data.team} />
            {myTeam && <PushToggle team={myTeam} />}
            {data.later.length > 0 && (
              <>
                <h3 className="home-section-title">Daarna</h3>
                <div className="cards-list">
                  {data.later.map((match, i) => (
                    <MatchCard key={match.link || `${match.titel}-${i}`} item={match} />
                  ))}
                </div>
              </>
            )}
            {data.team && (
              <Link href="/programma?team=ALL" className="home-all-link">
                Alle clubwedstrijden bekijken
              </Link>
            )}
            {data.vnl.length > 0 && (
              <>
                <h3 className="home-section-title">Internationaal — Nations League</h3>
                <p className="page-subtitle">
                  Geen VVH-wedstrijden gepland; dit zijn de komende Nations League-wedstrijden.
                </p>
                <div className="cards-list">
                  {data.vnl.map((match) => (
                    <InternationalMatchCard key={match.idEvent} match={match} />
                  ))}
                </div>
              </>
            )}
            {!data.next && !data.lastResult && data.vnl.length === 0 && (
              <p className="empty-state">Geen geplande wedstrijden binnenkort.</p>
            )}
          </>
        )}
      </section>
    </div>
  );
}
