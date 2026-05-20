import {
  fetchJson,
  proxyUrlWithEncodedTarget,
} from "@/lib/api/client";

const API_BASE = "https://www.thesportsdb.com/api/v1/json/3";
const MENS_LEAGUE_ID = "5083";
const WOMENS_LEAGUE_ID = "5084";

export interface TheSportsDbEvent {
  idEvent: string;
  strEvent: string;
  strTimestamp?: string;
  dateEvent?: string;
  strTime?: string;
  strTimeLocal?: string;
  strStatus?: string;
  strHomeTeam?: string;
  strAwayTeam?: string;
  strVenue?: string;
  strCity?: string;
  strCountry?: string;
  strLeague?: string;
  idLeague?: string;
}

export interface InternationalMatch {
  idEvent: string;
  titel: string;
  datum: Date;
  locatie: string;
  gender: "Heren" | "Dames";
  link: string;
}

interface EventsSeasonResponse {
  events: TheSportsDbEvent[] | null;
}

async function fetchTheSportsDb<T>(url: string): Promise<T> {
  try {
    return await fetchJson<T>(url);
  } catch {
    return fetchJson<T>(proxyUrlWithEncodedTarget(url));
  }
}

function cleanTeamName(name: string): string {
  return name
    .replace(/ Volleyball Women$/i, "")
    .replace(/ Volleyball$/i, "")
    .trim();
}

function eventTitle(event: TheSportsDbEvent): string {
  if (event.strHomeTeam && event.strAwayTeam) {
    return `${cleanTeamName(event.strHomeTeam)} – ${cleanTeamName(event.strAwayTeam)}`;
  }
  return event.strEvent
    .replace(/ Volleyball Women/gi, "")
    .replace(/ Volleyball/gi, "")
    .replace(/\s+vs\s+/i, " – ")
    .trim();
}

function parseEventDate(event: TheSportsDbEvent): Date | null {
  if (event.strTimestamp) {
    const d = new Date(event.strTimestamp);
    if (!Number.isNaN(d.getTime())) return d;
  }
  if (event.dateEvent) {
    const time = event.strTimeLocal || event.strTime || "12:00:00";
    const d = new Date(`${event.dateEvent}T${time}`);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

function eventLocation(event: TheSportsDbEvent): string {
  const parts = [event.strVenue, event.strCity, event.strCountry].filter(
    Boolean
  );
  return parts.join(", ");
}

function genderForLeague(leagueId: string): "Heren" | "Dames" {
  return leagueId === WOMENS_LEAGUE_ID ? "Dames" : "Heren";
}

async function fetchLeagueSeason(
  leagueId: string,
  season: string
): Promise<InternationalMatch[]> {
  const url = `${API_BASE}/eventsseason.php?id=${leagueId}&s=${season}`;
  const data = await fetchTheSportsDb<EventsSeasonResponse>(url);
  if (!data.events?.length) return [];

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const gender = genderForLeague(leagueId);

  return data.events
    .filter((e) => e.strStatus === "NS" || !e.strStatus)
    .map((e) => {
      const datum = parseEventDate(e);
      if (!datum) return null;
      return {
        idEvent: e.idEvent,
        titel: eventTitle(e),
        datum,
        locatie: eventLocation(e),
        gender,
        link: `https://www.thesportsdb.com/event/${e.idEvent}`,
      };
    })
    .filter((m): m is InternationalMatch => m !== null && m.datum >= now);
}

export async function getNationsLeagueUpcoming(
  limit = 3
): Promise<InternationalMatch[]> {
  const season = String(new Date().getFullYear());
  const [mens, womens] = await Promise.all([
    fetchLeagueSeason(MENS_LEAGUE_ID, season),
    fetchLeagueSeason(WOMENS_LEAGUE_ID, season),
  ]);

  return [...mens, ...womens]
    .sort((a, b) => a.datum.getTime() - b.datum.getTime())
    .slice(0, limit);
}
