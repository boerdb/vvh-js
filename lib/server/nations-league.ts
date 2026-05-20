import { fetchUpstreamJson } from "@/lib/server/upstream";

const API_BASE = "https://www.thesportsdb.com/api/v1/json/3";
const MENS_LEAGUE_ID = "5083";
const WOMENS_LEAGUE_ID = "5084";

interface TheSportsDbEvent {
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
}

interface EventsSeasonResponse {
  events: TheSportsDbEvent[] | null;
}

export interface InternationalMatchDto {
  idEvent: string;
  titel: string;
  datum: string;
  locatie: string;
  gender: "Heren" | "Dames";
  link: string;
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
  return [event.strVenue, event.strCity, event.strCountry]
    .filter(Boolean)
    .join(", ");
}

function genderForLeague(leagueId: string): "Heren" | "Dames" {
  return leagueId === WOMENS_LEAGUE_ID ? "Dames" : "Heren";
}

async function fetchLeagueSeason(
  leagueId: string,
  season: string
): Promise<InternationalMatchDto[]> {
  const url = `${API_BASE}/eventsseason.php?id=${leagueId}&s=${season}`;
  const data = await fetchUpstreamJson<EventsSeasonResponse>(url);
  if (!data.events?.length) return [];

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const gender = genderForLeague(leagueId);

  return data.events
    .filter((e) => e.strStatus === "NS" || !e.strStatus)
    .map((e) => {
      const datum = parseEventDate(e);
      if (!datum || datum < now) return null;
      return {
        idEvent: e.idEvent,
        titel: eventTitle(e),
        datum: datum.toISOString(),
        locatie: eventLocation(e),
        gender,
        link: `https://www.thesportsdb.com/event/${e.idEvent}`,
      };
    })
    .filter((m): m is InternationalMatchDto => m !== null);
}

export async function getNationsLeagueUpcomingDto(
  limit = 3
): Promise<InternationalMatchDto[]> {
  const season = String(new Date().getFullYear());
  const [mens, womens] = await Promise.all([
    fetchLeagueSeason(MENS_LEAGUE_ID, season),
    fetchLeagueSeason(WOMENS_LEAGUE_ID, season),
  ]);

  return [...mens, ...womens]
    .sort((a, b) => new Date(a.datum).getTime() - new Date(b.datum).getTime())
    .slice(0, limit);
}
