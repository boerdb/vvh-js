import { VVH_TEAMS } from "@/lib/constants/teams";
import { ALL_TEAMS } from "@/hooks/useTeamFilter";

interface TeamFilterProps {
  value: string;
  onChange: (code: string) => void;
  includeAll?: boolean;
}

export function TeamFilter({
  value,
  onChange,
  includeAll = true,
}: TeamFilterProps) {
  return (
    <label className="team-filter">
      <span className="team-filter-label">Team</span>
      <select
        className="team-filter-select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Filter op team"
      >
        {includeAll && <option value={ALL_TEAMS}>Alle teams</option>}
        {VVH_TEAMS.map((team) => (
          <option key={team.code} value={team.code}>
            {team.label}
          </option>
        ))}
      </select>
    </label>
  );
}
