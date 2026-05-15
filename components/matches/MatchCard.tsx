import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { sanitizeHtml } from "@/lib/utils/sanitize";
import { toDate } from "@/lib/parsers/rss-xml";
import type { FeedItem } from "@/lib/types/models";

interface MatchCardProps {
  item: FeedItem;
  locatieLabel?: "Thuis" | "Uit";
}

export function MatchCard({ item, locatieLabel }: MatchCardProps) {
  const date = toDate(item.datum);
  const dateStr = date
    ? format(date, "dd-MM-yyyy HH:mm", { locale: nl })
    : "";

  return (
    <article className="match-card">
      <div className="match-card-header">
        <h3 className="match-card-title">{item.titel}</h3>
        {(dateStr || locatieLabel) && (
          <p className="match-card-subtitle">
            {dateStr}
            {locatieLabel && (
              <span className="locatie-tag">{locatieLabel}</span>
            )}
          </p>
        )}
      </div>
      <div className="match-card-body">
        <div
          className="match-description"
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(item.omschrijving),
          }}
        />
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
    </article>
  );
}
