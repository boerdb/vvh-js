/** VVH-verenigingscode bij Nevobo (zelfde als in de oude proxy.php). */
export const NEVOBO_VERENIGING_ID =
  process.env.NEVOBO_VERENIGING_ID ?? "CKL6L32";

const TEAM_SEGMENTS: Record<string, string> = {
  HS: "heren",
  DS: "dames",
  XB: "mix-b",
  MA: "meiden-a",
  MC: "meiden-c",
};

export function teamNevoboPath(teamCode: string): string {
  const match = teamCode.toUpperCase().match(/^([A-Z]+)(\d+)$/);
  if (!match) {
    throw new Error(`Ongeldige teamcode: ${teamCode}`);
  }
  const segment = TEAM_SEGMENTS[match[1]];
  if (!segment) {
    throw new Error(`Onbekend teamprefix: ${match[1]}`);
  }
  return `${segment}/${match[2]}`;
}

const NEVOBO_API = "https://api.nevobo.nl/export";

export function nevoboProgrammaUrl(): string {
  return `${NEVOBO_API}/vereniging/${NEVOBO_VERENIGING_ID}/programma.rss`;
}

export function nevoboTeamProgrammaUrl(teamCode: string): string {
  return `${NEVOBO_API}/team/${NEVOBO_VERENIGING_ID}/${teamNevoboPath(teamCode)}/programma.rss`;
}

export function nevoboTeamResultatenUrl(teamCode: string): string {
  return `${NEVOBO_API}/team/${NEVOBO_VERENIGING_ID}/${teamNevoboPath(teamCode)}/resultaten.rss`;
}

export function nevoboStandenUrl(): string {
  return `${NEVOBO_API}/vereniging/${NEVOBO_VERENIGING_ID}/stand.xlsx`;
}

export const NEVOBO_NIEUWS_URL = "https://api.nevobo.nl/export/nieuws.rss";

export const VVH_NEWS_URL =
  "https://www.vvh-harlingen.nl/wp-json/wp/v2/posts?_embed&per_page=5";
