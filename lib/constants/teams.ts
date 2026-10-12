export interface TeamOption {
  code: string;
  label: string;
  /** Nevobo-naam als die niet `V.V.H. XX N` is (combinatieteam). */
  nevoboName?: string;
  /** Andere vereniging als het team daar is ingeschreven. */
  verenigingId?: string;
}

/** Combinatieteam A-meiden, ingeschreven bij Dosko/Acta (Franeker). */
export const DOSKO_ACTA_VERENIGING_ID = "CKL6K2W";

export const VVH_TEAMS: TeamOption[] = [
  { code: "HS1", label: "Heren 1" },
  { code: "HS2", label: "Heren 2" },
  { code: "DS1", label: "Dames 1" },
  { code: "XA1", label: "Mix A1" },
  {
    code: "MA1",
    label: "Meisjes A1",
    nevoboName: "DOSKO/Acta MA 1",
    verenigingId: DOSKO_ACTA_VERENIGING_ID,
  },
  { code: "MB1", label: "Meisjes B1" },
  { code: "MC1", label: "Meisjes C1" },
];

export const VVH_VOLLEY_STARS_TEAMS: TeamOption[] = [
  { code: "L41", label: "Volley Stars L4 1" },
];

/** Programma, thuiswedstrijden en uitslagen. Geen standen: L4 is bloktoernooi. */
export const VVH_WEDSTRIJD_TEAMS: TeamOption[] = [
  ...VVH_TEAMS,
  ...VVH_VOLLEY_STARS_TEAMS,
];

/** Langste prefix eerst, zodat L41 → L4 + 1 en niet L + 41. */
const TEAM_PREFIXES = ["L4", "HS", "DS", "XA", "MA", "MB", "MC"];

export function getTeamOption(code: string): TeamOption | undefined {
  const normalized = String(code || "").toUpperCase().replace(/\s+/g, "");
  return VVH_WEDSTRIJD_TEAMS.find((team) => team.code === normalized);
}

export function getCombinationTeams(): TeamOption[] {
  return VVH_WEDSTRIJD_TEAMS.filter((team) => Boolean(team.verenigingId));
}

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

export function getNevoboTeamName(code: string): string {
  const team = getTeamOption(code);
  if (team?.nevoboName) return team.nevoboName;
  const parsed = parseTeamCode(code);
  if (!parsed) return String(code || "").trim();
  return `V.V.H. ${parsed.prefix} ${parsed.number}`;
}

export function getTeamLabel(code: string): string {
  const normalized = code.toUpperCase();
  return (
    VVH_WEDSTRIJD_TEAMS.find((t) => t.code === normalized)?.label ??
    formatTeamCode(code)
  );
}
