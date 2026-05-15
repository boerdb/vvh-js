import { fetchText, proxyUrl, proxyUrlWithEncodedTarget } from "@/lib/api/client";
import { parseRssItems } from "@/lib/parsers/rss-xml";
import type { FeedItem } from "@/lib/types/models";

export async function getProgramma(): Promise<FeedItem[]> {
  const xml = await fetchText(proxyUrl({ type: "programma" }));
  return parseRssItems(xml);
}

const NEVOBO_NIEUWS_URL = "https://api.nevobo.nl/export/nieuws.rss";

export async function getNevoboNieuws(): Promise<FeedItem[]> {
  const xml = await fetchText(proxyUrlWithEncodedTarget(NEVOBO_NIEUWS_URL));
  return parseRssItems(xml);
}
