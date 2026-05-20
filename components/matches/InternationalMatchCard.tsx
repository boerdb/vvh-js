import { format } from "date-fns";
import { nl } from "date-fns/locale";
import type { InternationalMatch } from "@/lib/api/thesportsdb";

interface InternationalMatchCardProps {
  match: InternationalMatch;
}

export function InternationalMatchCard({ match }: InternationalMatchCardProps) {
  const dateStr = format(match.datum, "dd-MM-yyyy HH:mm", { locale: nl });

  return (
    <article className="match-card">
      <div className="match-card-header">
        <h3 className="match-card-title">{match.titel}</h3>
        <p className="match-card-subtitle">
          {dateStr}
          <span className="locatie-tag">{match.gender}</span>
        </p>
      </div>
      <div className="match-card-body">
        {match.locatie && (
          <p className="match-description">{match.locatie}</p>
        )}
        <a
          href={match.link}
          target="_blank"
          rel="noopener noreferrer"
          className="match-card-btn"
        >
          Meer info
        </a>
      </div>
    </article>
  );
}
