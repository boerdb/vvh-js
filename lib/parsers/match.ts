import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { isOwnTeamName, toDate } from "@/lib/parsers/rss-xml";
import type { FeedItem } from "@/lib/types/models";

export interface ParsedMatch {
  thuis: string;
  uit: string;
  /** Setstand per ploeg, alleen bij gespeelde wedstrijden. */
  uitslag: { thuis: number; uit: number } | null;
  setstanden: string[];
  speellocatie: string;
  /** Nevobo: "Vervallen: …" in de titel, "Vervallen wedstrijd: …" in de omschrijving. */
  vervallen: boolean;
  /** Nevobo-wedstrijdnummer uit de permalink. */
  wedstrijdId: string;
  vvhThuis: boolean;
  /** null als niet gespeeld of VVH niet (herkenbaar) meedoet. */
  vvhGewonnen: boolean | null;
}

/** "22 okt 20:00: " vóór de teams in het Nevobo-programma. */
const TITLE_DATE_PREFIX = /^\d{1,2}\s+\p{L}+\.?\s+\d{1,2}:\d{2}:\s*/u;
const VERVALLEN_PREFIX = /^Vervallen:\s*/i;

function descriptionField(description: string, field: string): string {
  const match = description.match(new RegExp(`${field}:\\s*([^]*?)(?:,\\s*[A-Z][a-z]+:|$)`));
  return match ? match[1].replace(/\s+/g, " ").trim() : "";
}

export function wedstrijdIdFromLink(link: string): string {
  return link.match(/wedstrijd\/(\d+)/)?.[1] ?? "";
}

/** Ontleedt Nevobo-wedstrijditems; null voor nieuws of onbekende vormen. */
export function parseMatch(item: FeedItem): ParsedMatch | null {
  const description = item.omschrijving || "";
  if (!/^(Vervallen )?wedstrijd:/i.test(description)) return null;

  const rawTitle = item.titel || "";
  const vervallen = VERVALLEN_PREFIX.test(rawTitle);
  const title = rawTitle
    .replace(VERVALLEN_PREFIX, "")
    .replace(TITLE_DATE_PREFIX, "");
  const [teamsPart, uitslagPart] = title.split(/,\s*Uitslag:\s*/);
  const teams = teamsPart.split(" - ");
  if (teams.length !== 2) return null;
  const [thuis, uit] = teams.map((t) => t.trim());

  const score = uitslagPart?.match(/^(\d+)-(\d+)/);
  const uitslag = score
    ? { thuis: Number(score[1]), uit: Number(score[2]) }
    : null;

  const setstanden = (description.match(/Setstanden:\s*(.*)$/)?.[1] ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^\d+-\d+$/.test(s));

  const vvhThuis = isOwnTeamName(thuis);
  const vvhUit = isOwnTeamName(uit);
  let vvhGewonnen: boolean | null = null;
  if (uitslag && uitslag.thuis !== uitslag.uit && vvhThuis !== vvhUit) {
    vvhGewonnen = vvhThuis
      ? uitslag.thuis > uitslag.uit
      : uitslag.uit > uitslag.thuis;
  }

  return {
    thuis,
    uit,
    uitslag,
    setstanden,
    speellocatie: descriptionField(description, "Speellocatie"),
    vervallen,
    wedstrijdId: wedstrijdIdFromLink(item.link),
    vvhThuis,
    vvhGewonnen,
  };
}

export interface DayGroup<T> {
  key: string;
  label: string;
  items: T[];
}

/** Groepeert op kalenderdag (lokale tijd), in de volgorde van de invoer. */
export function groupByDay<T extends FeedItem>(items: T[]): DayGroup<T>[] {
  const groups: DayGroup<T>[] = [];
  const byKey = new Map<string, DayGroup<T>>();
  for (const item of items) {
    const date = toDate(item.datum);
    const key = date ? format(date, "yyyy-MM-dd") : "onbekend";
    let group = byKey.get(key);
    if (!group) {
      const label = date
        ? format(date, "EEEE d MMMM", { locale: nl })
        : "Datum onbekend";
      group = { key, label: label[0].toUpperCase() + label.slice(1), items: [] };
      byKey.set(key, group);
      groups.push(group);
    }
    group.items.push(item);
  }
  return groups;
}
