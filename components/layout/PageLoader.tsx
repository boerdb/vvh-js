/** Skeleton-kaarten in de vorm van een wedstrijdkaart; de tekst is voor schermlezers. */
export function PageLoader({
  message = "Laden...",
  count = 3,
}: {
  message?: string;
  count?: number;
}) {
  return (
    <div className="skeleton-list" role="status" aria-live="polite">
      <span className="sr-only">{message}</span>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton-card" aria-hidden>
          <div className="skeleton-line skeleton-title" />
          <div className="skeleton-line skeleton-meta" />
          <div className="skeleton-block" />
          <div className="skeleton-line skeleton-button" />
        </div>
      ))}
    </div>
  );
}
