import Link from "next/link";
import { VVH_TEAMS } from "@/lib/constants/teams";

export default function TeamsPage() {
  return (
    <div className="page-container">
      <h1 className="page-title">Uitslagen</h1>
      <p className="page-subtitle">Kies een team</p>
      <div className="teams-grid">
        {VVH_TEAMS.map((team) => (
          <Link key={team.code} href={`/team/${team.code}`} className="team-link">
            {team.code}
            <span>{team.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
