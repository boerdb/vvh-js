export interface TeamOption {
  code: string;
  label: string;
}

export const VVH_TEAMS: TeamOption[] = [
  { code: "HS1", label: "Heren 1" },
  { code: "HS2", label: "Heren 2" },
  { code: "DS1", label: "Dames 1" },
  { code: "DS2", label: "Dames 2" },
  { code: "XB1", label: "Mix B1" },
  { code: "MA1", label: "Meisjes A1" },
  { code: "MC1", label: "Meisjes C1" },
];

export function formatTeamCode(code: string): string {
  const match = code.match(/^([A-Za-z]+)(\d+)$/);
  if (!match) return code;
  return `${match[1].toUpperCase()} ${match[2]}`;
}

export function getTeamLabel(code: string): string {
  return VVH_TEAMS.find((t) => t.code === code.toUpperCase())?.label ?? formatTeamCode(code);
}
