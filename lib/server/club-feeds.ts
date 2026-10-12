import {
  nevoboProgrammaUrl,
  nevoboResultatenUrl,
  nevoboTeamProgrammaUrl,
  nevoboTeamResultatenUrl,
} from "@/lib/constants/nevobo";
import { getCombinationTeams } from "@/lib/constants/teams";
import { parseRssItems } from "@/lib/parsers/rss-parse-server";
import { toDate } from "@/lib/parsers/rss-xml";
import type { FeedItem } from "@/lib/types/models";
import { fetchUpstreamText } from "@/lib/server/upstream";

function feedKey(item: FeedItem): string {
  return item.link || `${item.titel}|${String(item.datum ?? "")}`;
}

function mergeFeedItems(groups: FeedItem[][]): FeedItem[] {
  const seen = new Set<string>();
  const merged: FeedItem[] = [];
  for (const group of groups) {
    for (const item of group) {
      const key = feedKey(item);
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(item);
    }
  }
  return merged;
}

function sortByDate(items: FeedItem[], descending: boolean): FeedItem[] {
  return [...items].sort((a, b) => {
    const aTime = toDate(a.datum)?.getTime() ?? 0;
    const bTime = toDate(b.datum)?.getTime() ?? 0;
    return descending ? bTime - aTime : aTime - bTime;
  });
}

async function fetchOptionalRss(url: string): Promise<FeedItem[]> {
  try {
    return parseRssItems(await fetchUpstreamText(url));
  } catch (error) {
    console.error(`Combinatiefeed overgeslagen: ${url}`, error);
    return [];
  }
}

async function fetchClubFeed(
  kind: "programma" | "resultaten"
): Promise<FeedItem[]> {
  const clubUrl =
    kind === "programma" ? nevoboProgrammaUrl() : nevoboResultatenUrl();
  const extraUrls = getCombinationTeams().map((team) =>
    kind === "programma"
      ? nevoboTeamProgrammaUrl(team.code)
      : nevoboTeamResultatenUrl(team.code)
  );

  const [clubXml, extraFeeds] = await Promise.all([
    fetchUpstreamText(clubUrl),
    Promise.all(extraUrls.map(fetchOptionalRss)),
  ]);

  const merged = mergeFeedItems([parseRssItems(clubXml), ...extraFeeds]);
  return sortByDate(merged, kind === "resultaten");
}

export function fetchClubProgramma(): Promise<FeedItem[]> {
  return fetchClubFeed("programma");
}

export function fetchClubResultaten(): Promise<FeedItem[]> {
  return fetchClubFeed("resultaten");
}
