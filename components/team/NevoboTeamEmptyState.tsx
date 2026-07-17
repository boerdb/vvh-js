import { getTeamLabel } from "@/lib/constants/teams";

interface NevoboTeamEmptyStateProps {
  teamCode: string;
  kind: "uitslagen" | "standen";
}

export function NevoboTeamEmptyState({
  teamCode,
  kind,
}: NevoboTeamEmptyStateProps) {
  const label = getTeamLabel(teamCode);
  const dataLabel = kind === "uitslagen" ? "uitslagen" : "standen";

  return (
    <p className="empty-state">
      De Nevobo heeft op dit moment geen {dataLabel} beschikbaar voor{" "}
      {label}. Dit team neemt mogelijk niet deel aan de competitie dit seizoen.
    </p>
  );
}
