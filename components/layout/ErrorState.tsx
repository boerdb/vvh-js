interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="error-state" role="alert">
      <p>{message}</p>
      <p className="error-state-hint">
        Controleer je verbinding of probeer het zo nog eens.
      </p>
      <button type="button" className="match-card-btn" onClick={onRetry}>
        Opnieuw proberen
      </button>
    </div>
  );
}
