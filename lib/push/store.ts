import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Snapshot } from "@/lib/push/changes";

/** Alleen het push-adres van het toestel en het team; geen persoonsgegevens. */
export interface StoredSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  team: string;
  createdAt: string;
}

interface PushData {
  subscriptions: StoredSubscription[];
  snapshot: Snapshot;
}

/** Ruim boven het aantal leden; voorkomt dat iemand het bestand volspamt. */
export const MAX_SUBSCRIPTIONS = 5000;

const DATA_DIR = process.env.PUSH_DATA_DIR ?? path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "push.json");

let cache: PushData | null = null;
// Schrijfacties achter elkaar, zodat gelijktijdige verzoeken elkaar niet overschrijven.
let queue: Promise<unknown> = Promise.resolve();

async function load(): Promise<PushData> {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(await readFile(FILE, "utf8")) as Partial<PushData>;
    cache = {
      subscriptions: parsed.subscriptions ?? [],
      snapshot: parsed.snapshot ?? {},
    };
  } catch {
    cache = { subscriptions: [], snapshot: {} };
  }
  return cache;
}

async function save(data: PushData): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(data), "utf8");
  await rename(tmp, FILE);
}

/** Leest en wijzigt de data in één stap; het resultaat van `change` wordt teruggegeven. */
export function updatePushData<T>(change: (data: PushData) => T): Promise<T> {
  const run = queue.then(async () => {
    const data = await load();
    const result = change(data);
    await save(data);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

export async function readPushData(): Promise<PushData> {
  await queue;
  return load();
}
