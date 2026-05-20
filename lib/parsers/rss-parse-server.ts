import { JSDOM } from "jsdom";
import type { FeedItem } from "@/lib/types/models";

/** Alleen op de server (API-routes); browser heeft geen DOMParser. */
export function parseRssItems(xmlString: string): FeedItem[] {
  const startIndex = xmlString.indexOf("<");
  if (startIndex === -1) throw new Error("Geen XML");

  const cleanXml = xmlString.substring(startIndex).trim();
  const doc = new JSDOM(cleanXml, { contentType: "text/xml" }).window.document;
  const items = doc.querySelectorAll("item");

  return Array.from(items).map((item) => {
    const pubDate = item.querySelector("pubDate")?.textContent;
    let datumObject: Date | null = null;
    if (pubDate) {
      const d = new Date(pubDate);
      datumObject = Number.isNaN(d.getTime()) ? null : d;
    }

    let link = item.querySelector("link")?.textContent || "";
    const guid = item.querySelector("guid")?.textContent || "";
    if (!link && guid.startsWith("http")) {
      link = guid;
    }

    return {
      titel: item.querySelector("title")?.textContent || "Geen titel",
      link,
      omschrijving:
        item.querySelector("description")?.textContent ||
        "Geen details beschikbaar.",
      datum: datumObject,
    };
  });
}
