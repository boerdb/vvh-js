import { fetchArrayBuffer, fetchText, proxyUrl } from "@/lib/api/client";
import { parseRssItems } from "@/lib/parsers/rss-xml";
import { parseStandenFromBuffer } from "@/lib/parsers/standen-xlsx";
import type { FeedItem, StandenResult } from "@/lib/types/models";

export async function getTeamProgramma(teamCode: string): Promise<FeedItem[]> {
  const xml = await fetchText(
    proxyUrl({ team: teamCode.toUpperCase() })
  );
  return parseRssItems(xml);
}

export async function getTeamResultaten(teamCode: string): Promise<FeedItem[]> {
  const xml = await fetchText(
    proxyUrl({ team: teamCode.toUpperCase(), type: "resultaten" })
  );
  return parseRssItems(xml);
}

export async function getStanden(teamCode: string): Promise<StandenResult> {
  const buffer = await fetchArrayBuffer(proxyUrl({ type: "standen" }));
  return parseStandenFromBuffer(buffer, teamCode);
}
