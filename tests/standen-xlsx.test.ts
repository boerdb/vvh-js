import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";
import { parseStandenFromBuffer } from "@/lib/parsers/standen-xlsx";

/** Zelfde opbouw als stand.xlsx van Nevobo: titelregel, kopregel, teams, lege regel. */
function workbookBuffer(rows: unknown[][]): ArrayBuffer {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), "Stand");
  const out = XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
  return out;
}

const rows: unknown[][] = [
  ["V.V.H. DS 1", "Bekertoernooi senioren, Beker Dames C ronde 1 poule 26"],
  ["Ranking", "Team", "W", "P", "S+", "S-"],
  [1, "VC Drachten DS 4", 3, 9, 9, 0],
  [2, "V.V.H. DS 1", 3, 6, 6, 3],
  [],
  ["V.V.H. DS 1", "Dames 2e klasse B"],
  ["Ranking", "Team", "W", "P", "S+", "S-"],
  [1, "Wyngaard DS 1", 3, 7, 8, 3],
  [2, "V.V.H. DS 1", 3, 7, 8, 4],
  [],
  ["V.V.H. HS 1", "Heren 2e klasse"],
  ["Ranking", "Team", "W", "P", "S+", "S-"],
  [1, "V.V.H. HS 1", 2, 6, 6, 0],
];

describe("parseStandenFromBuffer", () => {
  it("zet de reguliere competitie vóór de beker, met echte poulenamen", () => {
    const result = parseStandenFromBuffer(workbookBuffer(rows), "DS1");

    expect(result.poule).toBe("Dames 2e klasse B");
    expect(result.standen).toEqual([
      { isDivider: true, titel: "Dames 2e klasse B" },
      expect.objectContaining({ rank: "1", team: "Wyngaard DS 1", sets: "8-3", isVVH: false }),
      expect.objectContaining({ rank: "2", team: "V.V.H. DS 1", punten: "7", isVVH: true }),
      { isDivider: true, titel: "Bekertoernooi senioren, Beker Dames C ronde 1 poule 26" },
      expect.objectContaining({ team: "VC Drachten DS 4" }),
      expect.objectContaining({ team: "V.V.H. DS 1", isVVH: true }),
    ]);
  });

  it("zonder scheidingsregel bij één tabel en zonder rijen van andere clubteams", () => {
    const result = parseStandenFromBuffer(workbookBuffer(rows), "HS1");
    expect(result.poule).toBe("Heren 2e klasse");
    expect(result.standen).toHaveLength(1);
    expect(result.standen[0]).toMatchObject({ team: "V.V.H. HS 1", isVVH: true });
  });

  it("geeft een lege stand voor een onbekende teamcode", () => {
    expect(parseStandenFromBuffer(workbookBuffer(rows), "undefined")).toEqual({
      standen: [],
      poule: "",
    });
  });
});
