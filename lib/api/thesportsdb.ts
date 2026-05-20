import { fetchApiJson } from "@/lib/api/fetch-api";

export interface InternationalMatch {
  idEvent: string;
  titel: string;
  datum: Date;
  locatie: string;
  gender: "Heren" | "Dames";
  link: string;
}

interface InternationalMatchDto {
  idEvent: string;
  titel: string;
  datum: string;
  locatie: string;
  gender: "Heren" | "Dames";
  link: string;
}

export async function getNationsLeagueUpcoming(
  limit = 3
): Promise<InternationalMatch[]> {
  const items = await fetchApiJson<InternationalMatchDto[]>(
    `/api/nations-league?limit=${limit}`
  );
  return items.map((m) => ({
    ...m,
    datum: new Date(m.datum),
  }));
}
