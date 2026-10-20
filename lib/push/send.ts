import webpush from "web-push";
import type { PushEvent } from "@/lib/push/changes";
import { updatePushData, type StoredSubscription } from "@/lib/push/store";

let configured: boolean | null = null;

/** VAPID-sleutels uit de omgeving; zonder sleutels staan meldingen uit. */
export function getVapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY || null;
}

export function pushEnabled(): boolean {
  if (configured !== null) return configured;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    configured = false;
    return configured;
  }
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "https://vvh.clvs.nl",
    publicKey,
    privateKey
  );
  configured = true;
  return configured;
}

type Payload = Pick<PushEvent, "title" | "body" | "url" | "tag">;

/** Stuurt naar alle opgegeven abonnementen; verlopen abonnementen worden opgeruimd. */
export async function sendToSubscriptions(
  subscriptions: StoredSubscription[],
  payload: Payload
): Promise<{ sent: number; removed: number }> {
  if (!pushEnabled() || subscriptions.length === 0) return { sent: 0, removed: 0 };

  const body = JSON.stringify(payload);
  const gone: string[] = [];
  let sent = 0;
  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          body,
          { TTL: 6 * 60 * 60, urgency: "normal", topic: payload.tag.slice(0, 32) }
        );
        sent++;
      } catch (error) {
        const status = (error as { statusCode?: number }).statusCode;
        // 404/410: toestel heeft het abonnement opgezegd of de app verwijderd.
        if (status === 404 || status === 410) gone.push(sub.endpoint);
        else console.error("[push] versturen mislukt", status ?? error);
      }
    })
  );

  if (gone.length > 0) {
    await updatePushData((data) => {
      data.subscriptions = data.subscriptions.filter((s) => !gone.includes(s.endpoint));
    });
  }
  return { sent, removed: gone.length };
}
