import type { FeedItem } from "@/lib/types/models";

export function parseRssItems(xmlString: string): FeedItem[] {
  const startIndex = xmlString.indexOf("<");
  if (startIndex === -1) throw new Error("Geen XML");

  const cleanXml = xmlString.substring(startIndex).trim();
  const parser = new DOMParser();
  const xml = parser.parseFromString(cleanXml, "text/xml");
  const items = Array.from(xml.querySelectorAll("item"));

  return items.map((item) => {
    const pubDate = item.querySelector("pubDate")?.textContent;
    let datumObject: Date | null = null;
    if (pubDate) {
      const d = new Date(pubDate);
      datumObject = isNaN(d.getTime()) ? null : d;
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

export function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date && !isNaN(value.getTime())) return value;
  const parsed = new Date(String(value));
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function getLocatieLabel(title: string): "Thuis" | "Uit" {
  const teams = (title || "").split(" - ").map((part) => part.trim());
  const first = teams[0] || "";
  return /V\.?V\.?H\.?/i.test(first) ? "Thuis" : "Uit";
}
