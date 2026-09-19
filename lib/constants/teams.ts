export interface TeamOption {
  code: string;
  label: string;
}

export const VVH_TEAMS: TeamOption[] = [
  { code: "HS1", label: "Heren 1" },
  { code: "HS2", label: "Heren 2" },
  { code: "DS1", label: "Dames 1" },
  { code: "XA1", label: "Mix A1" },
  { code: "MB1", label: "Meisjes B1" },
  { code: "MC1", label: "Meisjes C1" },
];

export const VVH_VOLLEY_STARS_TEAMS: TeamOption[] = [
  { code: "L41", label: "Volley Stars L4 1" },
];

export const VVH_UITSLAGEN_TEAMS: TeamOption[] = [
  ...VVH_TEAMS,
  ...VVH_VOLLEY_STARS_TEAMS,
];

/** Langste prefix eerst, zodat L41 → L4 + 1 en niet L + 41. */
const TEAM_PREFIXES = ["L4", "HS", "DS", "XA", "MB", "MC"];

export function parseTeamCode(
  code: string
): { prefix: string; number: string } | null {
  const normalized = String(code || "")
    .toUpperCase()
    .replace(/\s+/g, "");
  const prefixes = [...TEAM_PREFIXES].sort((a, b) => b.length - a.length);
  for (const prefix of prefixes) {
    if (!normalized.startsWith(prefix)) continue;
    const number = normalized.slice(prefix.length);
    if (/^\d+$/.test(number)) return { prefix, number };
  }
  const match = normalized.match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;
  return { prefix: match[1], number: match[2] };
}

export function formatTeamCode(code: string): string {
  const parsed = parseTeamCode(code);
  if (!parsed) return code;
  return `${parsed.prefix} ${parsed.number}`;
}

export function getTeamLabel(code: string): string {
  const normalized = code.toUpperCase();
  return (
    VVH_UITSLAGEN_TEAMS.find((t) => t.code === normalized)?.label ??
    formatTeamCode(code)
  );
}
