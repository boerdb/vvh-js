import { getTeamLabel, VVH_WEDSTRIJD_TEAMS } from "@/lib/constants/teams";
import { parseMatch } from "@/lib/parsers/match";
import { isOwnTeamName, matchesVvhTeam, toDate } from "@/lib/parsers/rss-xml";
import type { FeedItem } from "@/lib/types/models";

/** Wat we per wedstrijd onthouden om wijzigingen te zien. */
export interface MatchState {
  datum: string | null;
  vervallen: boolean;
  /** "3-1" vanuit VVH gezien (eigen sets eerst), of null. */
  score: string | null;
  vvhGewonnen: boolean | null;
  vvhThuis: boolean;
  opponent: string;
  teams: string[];
}

export type Snapshot = Record<string, MatchState>;

export interface PushEvent {
  team: string;
  title: string;
  body: string;
  url: string;
  /** Zelfde tag vervangt een eerdere melding over dezelfde wedstrijd. */
  tag: string;
}

/** Uitslagen ouder dan dit sturen we niet meer (bijv. bij een nieuwe feedperiode). */
const RESULT_MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000;

const dateFormat = new Intl.DateTimeFormat("nl-NL", {
  timeZone: "Europe/Amsterdam",
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function formatWhen(iso: string): string {
  // "do 22 okt, 20:30" → "do 22 okt 20:30", zoals elders in de app.
  return dateFormat.format(new Date(iso)).replace(",", "");
}

function opponentOf(thuis: string, uit: string): string {
  if (isOwnTeamName(thuis) && !isOwnTeamName(uit)) return uit;
  if (isOwnTeamName(uit) && !isOwnTeamName(thuis)) return thuis;
  return `${thuis} - ${uit}`;
}

/** Programma en uitslagen samen; latere items (uitslagen) winnen. */
export function buildSnapshot(items: FeedItem[]): Snapshot {
  const snapshot: Snapshot = {};
  for (const item of items) {
    const match = parseMatch(item);
    if (!match?.wedstrijdId) continue;
    const teams = VVH_WEDSTRIJD_TEAMS.filter((t) => matchesVvhTeam(item, t.code)).map(
      (t) => t.code
    );
    if (teams.length === 0) continue;
    const score = match.uitslag
      ? match.vvhThuis
        ? `${match.uitslag.thuis}-${match.uitslag.uit}`
        : `${match.uitslag.uit}-${match.uitslag.thuis}`
      : null;
    snapshot[match.wedstrijdId] = {
      datum: toDate(item.datum)?.toISOString() ?? null,
      vervallen: match.vervallen,
      score,
      vvhGewonnen: match.vvhGewonnen,
      vvhThuis: match.vvhThuis,
      opponent: opponentOf(match.thuis, match.uit),
      teams,
    };
  }
  return snapshot;
}

/** Meldingen voor wat er sinds de vorige snapshot is veranderd. */
export function diffSnapshots(prev: Snapshot, next: Snapshot, now = Date.now()): PushEvent[] {
  // Eerste keer: alleen onthouden, niets sturen.
  if (Object.keys(prev).length === 0) return [];

  const events: PushEvent[] = [];
  for (const [id, n] of Object.entries(next)) {
    const p = prev[id];
    const waar = `${n.vvhThuis ? "Thuis" : "Uit"} tegen ${n.opponent}`;

    for (const team of n.teams) {
      const label = getTeamLabel(team);

      if (n.score && !p?.score) {
        const recent = n.datum && now - new Date(n.datum).getTime() < RESULT_MAX_AGE_MS;
        if (!recent) continue;
        const uitkomst =
          n.vvhGewonnen === null ? "uitslag" : n.vvhGewonnen ? "gewonnen" : "verloren";
        events.push({
          team,
          title: `${label}: ${uitkomst} ${n.score}`,
          body: waar,
          url: `/teams?team=${team}`,
          tag: `uitslag-${id}`,
        });
      } else if (p && !p.vervallen && n.vervallen) {
        events.push({
          team,
          title: `${label}: wedstrijd vervallen`,
          body: n.datum ? `${waar}, ${formatWhen(n.datum)}` : waar,
          url: `/programma?team=${team}`,
          tag: `wedstrijd-${id}`,
        });
      } else if (
        p?.datum &&
        n.datum &&
        p.datum !== n.datum &&
        !n.score &&
        !n.vervallen
      ) {
        events.push({
          team,
          title: `${label}: nieuwe aanvangstijd`,
          body: `${waar}, nu ${formatWhen(n.datum)} (was ${formatWhen(p.datum)})`,
          url: `/programma?team=${team}`,
          tag: `wedstrijd-${id}`,
        });
      }
    }
  }
  return events;
}
