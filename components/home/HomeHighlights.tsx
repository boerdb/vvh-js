import Link from "next/link";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { CalendarClock, MapPin, Trophy } from "lucide-react";
import { parseMatch } from "@/lib/parsers/match";
import { getTeamLabel, VVH_WEDSTRIJD_TEAMS } from "@/lib/constants/teams";
import { isOwnTeamName, matchesVvhTeam, toDate } from "@/lib/parsers/rss-xml";
import { relativeDayLabel } from "@/lib/utils/relative-day";
import type { FeedItem } from "@/lib/types/models";

/** Tegenstander vanuit VVH gezien; bij een onderling duel beide teams. */
function opponent(thuis: string, uit: string): string {
  if (isOwnTeamName(thuis) && !isOwnTeamName(uit)) return uit;
  if (isOwnTeamName(uit) && !isOwnTeamName(thuis)) return thuis;
  return `${thuis} - ${uit}`;
}

interface TileProps {
  item: FeedItem;
  teamFilter: string;
  /** Zonder Mijn team: erbij zetten welk VVH-team het is. */
  showTeam: boolean;
}

/** Welk VVH-team speelt ("Heren 2"); nodig als de tegels voor de hele club zijn. */
function vvhTeamLabel(item: FeedItem): string | null {
  const team = VVH_WEDSTRIJD_TEAMS.find((t) => matchesVvhTeam(item, t.code));
  return team ? getTeamLabel(team.code) : null;
}

function TeamLine({ item, showTeam }: { item: FeedItem; showTeam: boolean }) {
  const label = showTeam ? vvhTeamLabel(item) : null;
  return label ? <span className="home-tile-team">{label}</span> : null;
}

function NextMatchTile({ item, teamFilter, showTeam }: TileProps) {
  const match = parseMatch(item);
  const date = toDate(item.datum);
  if (!match || !date) return null;
  const plaats = match.speellocatie.split(",")[0];

  return (
    <Link href={`/programma${teamFilter}`} className="home-tile">
      <span className="home-tile-label">
        <CalendarClock size={16} aria-hidden /> Volgende wedstrijd
      </span>
      <strong className="home-tile-when">{relativeDayLabel(date)}</strong>
      <TeamLine item={item} showTeam={showTeam} />
      <span className="home-tile-main">
        {match.vvhThuis ? "Thuis" : "Uit"} tegen {opponent(match.thuis, match.uit)}
      </span>
      {plaats && (
        <span className="home-tile-sub">
          <MapPin size={14} aria-hidden /> {plaats}
        </span>
      )}
    </Link>
  );
}

function LastResultTile({ item, teamFilter, showTeam }: TileProps) {
  const match = parseMatch(item);
  const date = toDate(item.datum);
  if (!match?.uitslag) return null;
  const resultClass =
    match.vvhGewonnen === null ? "" : match.vvhGewonnen ? "won" : "lost";
  // Score vanuit VVH: eigen sets eerst.
  const [voor, tegen] = match.vvhThuis
    ? [match.uitslag.thuis, match.uitslag.uit]
    : [match.uitslag.uit, match.uitslag.thuis];

  return (
    <Link href={`/teams${teamFilter}`} className={`home-tile home-tile-result ${resultClass}`}>
      <span className="home-tile-label">
        <Trophy size={16} aria-hidden /> Laatste uitslag
      </span>
      <strong className="home-tile-score">
        <span className="home-tile-score-value">
          {voor} – {tegen}
        </span>
        {match.vvhGewonnen !== null && (
          <span className="match-result-badge">
            {match.vvhGewonnen ? "Gewonnen" : "Verloren"}
          </span>
        )}
      </strong>
      <TeamLine item={item} showTeam={showTeam} />
      <span className="home-tile-main">
        {match.vvhThuis ? "Thuis" : "Uit"} tegen {opponent(match.thuis, match.uit)}
      </span>
      {date && (
        <span className="home-tile-sub">
          {format(date, "EEEEEE d MMM", { locale: nl })}
        </span>
      )}
    </Link>
  );
}

interface HomeHighlightsProps {
  next: FeedItem | null;
  lastResult: FeedItem | null;
  team: string | null;
}

export function HomeHighlights({ next, lastResult, team }: HomeHighlightsProps) {
  if (!next && !lastResult) return null;
  const teamFilter = team ? `?team=${team}` : "";
  return (
    <div className="home-tiles">
      {next && <NextMatchTile item={next} teamFilter={teamFilter} showTeam={!team} />}
      {lastResult && (
        <LastResultTile item={lastResult} teamFilter={teamFilter} showTeam={!team} />
      )}
    </div>
  );
}
