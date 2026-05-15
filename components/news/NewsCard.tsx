import Image from "next/image";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { sanitizeHtml } from "@/lib/utils/sanitize";
import { toDate } from "@/lib/parsers/rss-xml";
import type { NewsItem } from "@/lib/types/models";

interface NewsCardProps {
  item: NewsItem;
}

export function NewsCard({ item }: NewsCardProps) {
  const date = toDate(item.datum);
  const dateStr = date
    ? format(date, "dd MMMM yyyy", { locale: nl })
    : "";

  return (
    <article className="match-card news-card">
      {item.image && (
        <div className="news-card-image-wrap">
          <Image
            src={item.image}
            alt={item.titel}
            width={640}
            height={480}
            className="news-card-image"
            sizes="(max-width: 640px) 100vw, 640px"
            unoptimized
          />
        </div>
      )}
      <div className="match-card-header">
        <h3 className="match-card-title">{item.titel}</h3>
        {dateStr && <p className="match-card-subtitle">{dateStr}</p>}
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
            Lees meer
          </a>
        )}
      </div>
    </article>
  );
}
