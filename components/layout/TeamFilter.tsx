"use client";

import { Star } from "lucide-react";
import { VVH_TEAMS, getTeamLabel, type TeamOption } from "@/lib/constants/teams";
import { ALL_TEAMS } from "@/hooks/useTeamFilter";
import { useMyTeam } from "@/hooks/useMyTeam";

interface TeamFilterProps {
  value: string;
  onChange: (code: string) => void;
  includeAll?: boolean;
  teams?: TeamOption[];
}

export function TeamFilter({
  value,
  onChange,
  includeAll = true,
  teams = VVH_TEAMS,
}: TeamFilterProps) {
  const { myTeam, setMyTeam } = useMyTeam();
  const isMyTeam = value !== ALL_TEAMS && value === myTeam;

  return (
    <div className="team-filter">
      <label className="team-filter-label" htmlFor="team-filter-select">
        Team
      </label>
      <div className="team-filter-row">
        <select
          id="team-filter-select"
          className="team-filter-select"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label="Filter op team"
        >
          {includeAll && <option value={ALL_TEAMS}>Alle teams</option>}
          {teams.map((team) => (
            <option key={team.code} value={team.code}>
              {team.code === myTeam ? `★ ${team.label}` : team.label}
            </option>
          ))}
        </select>
        {value !== ALL_TEAMS && (
          <button
            type="button"
            className={`my-team-btn ${isMyTeam ? "active" : ""}`}
            onClick={() => setMyTeam(isMyTeam ? null : value)}
            aria-pressed={isMyTeam}
            aria-label={
              isMyTeam
                ? `${getTeamLabel(value)} is je team; klik om te verwijderen`
                : `${getTeamLabel(value)} instellen als mijn team`
            }
            title={isMyTeam ? "Mijn team" : "Instellen als mijn team"}
          >
            <Star size={18} fill={isMyTeam ? "currentColor" : "none"} />
          </button>
        )}
      </div>
    </div>
  );
}
