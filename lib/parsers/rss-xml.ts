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

/** Match Nevobo-titels als "V.V.H. HS 1" of "V.V.H. DS 2". */
export function matchesVvhTeam(
  item: { titel?: string; omschrijving?: string },
  teamCode: string
): boolean {
  const match = teamCode.toUpperCase().match(/^([A-Z]+)(\d+)$/);
  if (!match) return false;
  const needle = `V.V.H. ${match[1]} ${match[2]}`;
  const haystack = `${item.titel || ""} ${item.omschrijving || ""}`;
  return haystack.includes(needle);
}
