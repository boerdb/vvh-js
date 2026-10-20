import { buildSnapshot, diffSnapshots } from "@/lib/push/changes";
import { pushEnabled, sendToSubscriptions } from "@/lib/push/send";
import { readPushData, updatePushData } from "@/lib/push/store";
import { fetchClubProgramma, fetchClubResultaten } from "@/lib/server/club-feeds";

const CHECK_INTERVAL_MS = 10 * 60 * 1000;
const FIRST_CHECK_DELAY_MS = 30 * 1000;

/** Eén ronde: feeds ophalen, vergelijken met de vorige keer, meldingen sturen. */
export async function checkForChanges(): Promise<number> {
  const [programma, resultaten] = await Promise.all([
    fetchClubProgramma(),
    fetchClubResultaten(),
  ]);
  // Uitslagen als laatste, zodat de score de geplande versie overschrijft.
  const next = buildSnapshot([...programma, ...resultaten]);

  const events = await updatePushData((data) => {
    // Wedstrijden die uit de feeds vallen niet vergeten, anders lijken ze later "nieuw".
    const merged = { ...data.snapshot, ...next };
    const found = diffSnapshots(data.snapshot, next);
    data.snapshot = merged;
    return found;
  });
  if (events.length === 0) return 0;

  const { subscriptions } = await readPushData();
  let sent = 0;
  for (const event of events) {
    const targets = subscriptions.filter((s) => s.team === event.team);
    sent += (await sendToSubscriptions(targets, event)).sent;
  }
  console.log(`[push] ${events.length} wijziging(en), ${sent} melding(en) verstuurd`);
  return sent;
}

const globalState = globalThis as typeof globalThis & { __vvhPushWatcher?: boolean };

export function startPushWatcher(): void {
  if (!pushEnabled()) {
    console.log("[push] uit: VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY niet gezet");
    return;
  }
  // Niet dubbel starten (dev-server laadt modules opnieuw).
  if (globalState.__vvhPushWatcher) return;
  globalState.__vvhPushWatcher = true;

  const run = () =>
    checkForChanges().catch((error) => console.error("[push] controle mislukt", error));
  setTimeout(run, FIRST_CHECK_DELAY_MS);
  setInterval(run, CHECK_INTERVAL_MS).unref();
  console.log("[push] wijzigingen worden elke 10 minuten gecontroleerd");
}
