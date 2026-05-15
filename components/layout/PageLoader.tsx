export function PageLoader({ message = "Laden..." }: { message?: string }) {
  return (
    <div className="loading-state">
      <div className="loading-spinner" aria-hidden />
      <p>{message}</p>
    </div>
  );
}
