import {
  getCombinationTeams,
  getNevoboTeamName,
} from "@/lib/constants/teams";

export function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date && !isNaN(value.getTime())) return value;
  const parsed = new Date(String(value));
  return isNaN(parsed.getTime()) ? null : parsed;
}

function isOwnTeamName(name: string): boolean {
  if (/V\.?V\.?H\.?/i.test(name)) return true;
  return getCombinationTeams().some(
    (team) => team.nevoboName && name.includes(team.nevoboName)
  );
}

export function getLocatieLabel(title: string): "Thuis" | "Uit" {
  const teams = (title || "").split(" - ").map((part) => part.trim());
  const first = teams[0] || "";
  return isOwnTeamName(first) ? "Thuis" : "Uit";
}

/** Match Nevobo-titels als "V.V.H. HS 1", "V.V.H. L4 1" of combinatieteams. */
export function matchesVvhTeam(
  item: { titel?: string; omschrijving?: string },
  teamCode: string
): boolean {
  const needle = getNevoboTeamName(teamCode);
  if (!needle) return false;
  const haystack = `${item.titel || ""} ${item.omschrijving || ""}`;
  return haystack.includes(needle);
}
