import { parseTeamCode } from "@/lib/constants/teams";

export function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date && !isNaN(value.getTime())) return value;
  const parsed = new Date(String(value));
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function getLocatieLabel(title: string): "Thuis" | "Uit" {
  const teams = (title || "").split(" - ").map((part) => part.trim());
  const first = teams[0] || "";
  return /V\.?V\.?H\.?/i.test(first) ? "Thuis" : "Uit";
}

/** Match Nevobo-titels als "V.V.H. HS 1" of "V.V.H. L4 1". */
export function matchesVvhTeam(
  item: { titel?: string; omschrijving?: string },
  teamCode: string
): boolean {
  const parsed = parseTeamCode(teamCode);
  if (!parsed) return false;
  const needle = `V.V.H. ${parsed.prefix} ${parsed.number}`;
  const haystack = `${item.titel || ""} ${item.omschrijving || ""}`;
  return haystack.includes(needle);
}
