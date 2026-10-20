import * as XLSX from "xlsx";
import { getNevoboTeamName } from "@/lib/constants/teams";
import type {
  StandenResult,
  StandingEntry,
  StandingRow,
} from "@/lib/types/models";

function clubPrefixFromSearch(searchString: string): string {
  return searchString.replace(/\s+[A-Z0-9]+ \d+\s*$/i, "").trim() || "V.V.H.";
}

function extractPouleFromTitleRow(row: unknown[], searchString: string): string {
  const cleanedCells = (row || [])
    .map((cell) => String(cell ?? "").replace(/"/g, "").trim())
    .filter((cell) => cell.length > 0);

  if (cleanedCells.length === 0) return "";

  const inlineTitle = cleanedCells.find(
    (cell) => cell.startsWith(searchString) && cell.length > searchString.length
  );
  if (inlineTitle) {
    return inlineTitle
      .slice(searchString.length)
      .replace(/^[\s-,:;]+/, "")
      .trim();
  }

  const separateTitle = cleanedCells.find(
    (cell) => cell !== searchString && !/^ranking$/i.test(cell)
  );
  return separateTitle || "";
}

export function parseStandenFromBuffer(
  buffer: ArrayBuffer,
  teamCode: string
): StandenResult {
  if (!teamCode || teamCode === "undefined") {
    return { standen: [], poule: "" };
  }

  const data = new Uint8Array(buffer);
  const workbook = XLSX.read(data, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  const searchString = getNevoboTeamName(teamCode);
  const clubPrefix = clubPrefixFromSearch(searchString);

  const tables: StandTable[] = [];
  let current: StandTable | null = null;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const firstCell = String(row[0] ?? "").trim();
    const isTeamTitleRow =
      firstCell.startsWith(searchString) ||
      firstCell.startsWith(`"${searchString}`);

    if (isTeamTitleRow) {
      current = { poule: extractPouleFromTitleRow(row, searchString), rows: [] };
      tables.push(current);
      continue;
    }

    if (!current) continue;

    // Titel van een ander clubteam of lege regel: einde van deze tabel.
    if (firstCell.startsWith(clubPrefix) || firstCell === "" || firstCell === "undefined") {
      current = null;
      continue;
    }

    if (firstCell === "Ranking") continue;

    if (row.length >= 6 && /^\d+$/.test(firstCell)) {
      current.rows.push({
        rank: String(row[0] ?? ""),
        team: String(row[1]).replace(/"/g, "").trim(),
        wedstrijden: String(row[2] ?? ""),
        punten: String(row[3] ?? ""),
        sets: `${row[4]}-${row[5]}`,
        isVVH: String(row[1]).includes(searchString),
      });
    }
  }

  // Reguliere competitie eerst; Nevobo zet de beker soms bovenaan.
  const ordered = tables
    .filter((table) => table.rows.length > 0)
    .sort((a, b) => Number(isBeker(a.poule)) - Number(isBeker(b.poule)));

  const standen: StandingEntry[] = ordered.flatMap((table, index) =>
    ordered.length > 1
      ? [{ isDivider: true as const, titel: table.poule || `Poule ${index + 1}` }, ...table.rows]
      : table.rows
  );

  return { standen, poule: ordered[0]?.poule ?? "" };
}

interface StandTable {
  poule: string;
  rows: StandingRow[];
}

function isBeker(poule: string): boolean {
  return /beker/i.test(poule);
}
