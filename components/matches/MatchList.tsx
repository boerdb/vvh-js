import { MatchCard } from "@/components/matches/MatchCard";
import { groupByDay } from "@/lib/parsers/match";
import type { FeedItem } from "@/lib/types/models";

interface MatchListProps {
  items: FeedItem[];
  emptyText: string;
}

/** Wedstrijden per speeldag, met de dag als kop. */
export function MatchList({ items, emptyText }: MatchListProps) {
  if (items.length === 0) {
    return <p className="empty-state">{emptyText}</p>;
  }

  return (
    <div className="day-groups">
      {groupByDay(items).map((group) => (
        <section key={group.key} className="day-group" aria-label={group.label}>
          <h2 className="day-heading">{group.label}</h2>
          <div className="cards-list">
            {group.items.map((item, i) => (
              <MatchCard
                key={item.link || `${item.titel}-${i}`}
                item={item}
                timeOnly
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
