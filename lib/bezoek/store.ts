import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export type BezoekerSoort = "app" | "browser";

export interface BezoekDag {
  /** Toestellen die de app die dag voor het eerst openden, als geïnstalleerde app. */
  app: number;
  /** Idem, in de gewone browser. */
  browser: number;
  /** Geopende pagina's: pad → aantal. */
  paginas: Record<string, number>;
}

export interface BezoekData {
  dagen: Record<string, BezoekDag>;
}

/** Oudere dagen worden weggegooid, zodat het bestand klein blijft. */
const BEWAAR_DAGEN = 400;

// Zelfde map als de pushmeldingen (lib/push/store.ts); overleeft een deploy.
const DATA_DIR = process.env.PUSH_DATA_DIR ?? path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "bezoek.json");

let cache: BezoekData | null = null;
// Schrijfacties achter elkaar, zodat gelijktijdige verzoeken elkaar niet overschrijven.
let queue: Promise<unknown> = Promise.resolve();

/** Datum in Nederlandse tijd (jjjj-mm-dd). */
export function dagNl(datum: Date = new Date()): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Amsterdam" }).format(datum);
}

async function load(): Promise<BezoekData> {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(await readFile(FILE, "utf8")) as Partial<BezoekData>;
    cache = { dagen: parsed.dagen ?? {} };
  } catch {
    cache = { dagen: {} };
  }
  return cache;
}

async function save(data: BezoekData): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(data), "utf8");
  await rename(tmp, FILE);
}

function ruimOp(data: BezoekData, vandaag: string): void {
  const grens = dagNl(new Date(Date.parse(`${vandaag}T12:00:00Z`) - BEWAAR_DAGEN * 86_400_000));
  for (const dag of Object.keys(data.dagen)) {
    if (dag < grens) delete data.dagen[dag];
  }
}

/**
 * Telt één op bij het dagtotaal. Er wordt geen IP-adres of apparaat-ID opgeslagen.
 * `bezoeker` = eerste keer vandaag op dit toestel; `pagina` = geopende pagina.
 */
export function telBezoek(
  tel: { bezoeker?: BezoekerSoort; pagina?: string },
  nu: Date = new Date(),
): Promise<void> {
  const run = queue.then(async () => {
    const data = await load();
    const vandaag = dagNl(nu);
    if (!data.dagen[vandaag]) ruimOp(data, vandaag);
    const dag = (data.dagen[vandaag] ??= { app: 0, browser: 0, paginas: {} });
    if (tel.bezoeker) dag[tel.bezoeker] += 1;
    if (tel.pagina) dag.paginas[tel.pagina] = (dag.paginas[tel.pagina] ?? 0) + 1;
    await save(data);
  });
  queue = run.catch(() => undefined);
  return run;
}

export async function leesBezoek(): Promise<BezoekData> {
  await queue;
  return load();
}
