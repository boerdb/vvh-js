import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { CalendarPlus, MapPin } from "lucide-react";
import { sanitizeHtml } from "@/lib/utils/sanitize";
import { parseMatch, type ParsedMatch } from "@/lib/parsers/match";
import { toDate } from "@/lib/parsers/rss-xml";
import type { FeedItem } from "@/lib/types/models";

interface MatchCardProps {
  item: FeedItem;
  locatieLabel?: "Thuis" | "Uit";
  /** In een lijst per dag staat de datum al in de kop. */
  timeOnly?: boolean;
}

function MatchResult({ match }: { match: ParsedMatch }) {
  const { uitslag, vvhGewonnen, setstanden } = match;
  if (!uitslag) return null;
  const resultClass =
    vvhGewonnen === null ? "" : vvhGewonnen ? "won" : "lost";

  return (
    <div className={`match-result ${resultClass}`}>
      <div className="match-score" aria-label={`Uitslag ${uitslag.thuis}-${uitslag.uit}`}>
        <span>{uitslag.thuis}</span>
        <span className="match-score-sep">–</span>
        <span>{uitslag.uit}</span>
      </div>
      {vvhGewonnen !== null && (
        <span className="match-result-badge">
          {vvhGewonnen ? "Gewonnen" : "Verloren"}
        </span>
      )}
      {setstanden.length > 0 && (
        <ul className="match-sets" aria-label="Setstanden">
          {setstanden.map((set, i) => (
            <li key={`${set}-${i}`}>{set}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function MatchCard({ item, locatieLabel, timeOnly = false }: MatchCardProps) {
  const date = toDate(item.datum);
  const dateStr = date
    ? format(date, timeOnly ? "HH:mm" : "EEEEEE d MMM HH:mm", { locale: nl })
    : "";
  const match = parseMatch(item);
  const label =
    locatieLabel ?? (match ? (match.vvhThuis ? "Thuis" : "Uit") : undefined);

  return (
    <article className="match-card">
      <div className="match-card-header">
        <h3 className="match-card-title">
          {match ? `${match.thuis} - ${match.uit}` : item.titel}
        </h3>
        {(dateStr || label) && (
          <p className="match-card-subtitle">
            {dateStr}
            {label && <span className="locatie-tag">{label}</span>}
            {match?.vervallen && (
              <span className="locatie-tag vervallen-tag">Vervallen</span>
            )}
          </p>
        )}
      </div>
      <div className="match-card-body">
        {match ? (
          <>
            <MatchResult match={match} />
            {!match.uitslag && match.speellocatie && (
              <p className="match-location">
                <MapPin size={16} aria-hidden />
                <span>{match.speellocatie}</span>
              </p>
            )}
          </>
        ) : (
          <div
            className="match-description"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(item.omschrijving),
            }}
          />
        )}
        <div className="match-card-actions">
          {match && !match.uitslag && !match.vervallen && match.wedstrijdId && (
            <a
              href={`/api/agenda?wedstrijd=${match.wedstrijdId}`}
              className="match-card-btn secondary"
              download
            >
              <CalendarPlus size={16} aria-hidden />
              In agenda
            </a>
          )}
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="match-card-btn"
            >
              Meer info
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
