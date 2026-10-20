import { NextResponse } from "next/server";
import { getTeamOption } from "@/lib/constants/teams";
import { getVapidPublicKey, pushEnabled, sendToSubscriptions } from "@/lib/push/send";
import { MAX_SUBSCRIPTIONS, readPushData, updatePushData } from "@/lib/push/store";

interface SubscriptionBody {
  subscription?: { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
  team?: unknown;
  endpoint?: unknown;
  action?: unknown;
}

function isEndpoint(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 1000) return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function isKey(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length < 200;
}

function disabled() {
  return NextResponse.json({ error: "Meldingen zijn niet ingeschakeld" }, { status: 503 });
}

/** Max. één testmelding per minuut per toestel. */
const lastTest = new Map<string, number>();

/** GET /api/push → publieke VAPID-sleutel (of 503 als meldingen uit staan). */
export async function GET() {
  const publicKey = getVapidPublicKey();
  if (!publicKey || !pushEnabled()) return disabled();
  return NextResponse.json({ publicKey });
}

/**
 * POST /api/push
 *   { subscription, team }        → aanmelden (of team wijzigen)
 *   { action: "test", endpoint }  → testmelding naar dit toestel
 */
export async function POST(request: Request) {
  if (!pushEnabled()) return disabled();
  const body = (await request.json().catch(() => ({}))) as SubscriptionBody;

  if (body.action === "test") {
    if (!isEndpoint(body.endpoint)) {
      return NextResponse.json({ error: "Ongeldig toestel" }, { status: 400 });
    }
    const { subscriptions } = await readPushData();
    const sub = subscriptions.find((s) => s.endpoint === body.endpoint);
    if (!sub) return NextResponse.json({ error: "Toestel niet aangemeld" }, { status: 404 });
    const last = lastTest.get(sub.endpoint) ?? 0;
    if (Date.now() - last < 60_000) {
      return NextResponse.json({ error: "Wacht even met een nieuwe test" }, { status: 429 });
    }
    lastTest.set(sub.endpoint, Date.now());
    const result = await sendToSubscriptions([sub], {
      title: "VVH Harlingen",
      body: "Meldingen werken! Je hoort het bij uitslagen en wijzigingen.",
      url: "/home",
      tag: "test",
    });
    return NextResponse.json(result);
  }

  const sub = body.subscription;
  const team = typeof body.team === "string" ? body.team.toUpperCase() : "";
  if (
    !sub ||
    !isEndpoint(sub.endpoint) ||
    !isKey(sub.keys?.p256dh) ||
    !isKey(sub.keys?.auth) ||
    !getTeamOption(team)
  ) {
    return NextResponse.json({ error: "Ongeldig abonnement" }, { status: 400 });
  }

  const { endpoint } = sub;
  const keys = { p256dh: sub.keys!.p256dh as string, auth: sub.keys!.auth as string };
  const ok = await updatePushData((data) => {
    const others = data.subscriptions.filter((s) => s.endpoint !== endpoint);
    if (others.length >= MAX_SUBSCRIPTIONS) return false;
    data.subscriptions = [
      ...others,
      { endpoint, keys, team, createdAt: new Date().toISOString() },
    ];
    return true;
  });
  if (!ok) return NextResponse.json({ error: "Te veel abonnementen" }, { status: 507 });
  return NextResponse.json({ ok: true, team });
}

/** DELETE /api/push { endpoint } → afmelden. */
export async function DELETE(request: Request) {
  const body = (await request.json().catch(() => ({}))) as SubscriptionBody;
  if (!isEndpoint(body.endpoint)) {
    return NextResponse.json({ error: "Ongeldig toestel" }, { status: 400 });
  }
  await updatePushData((data) => {
    data.subscriptions = data.subscriptions.filter((s) => s.endpoint !== body.endpoint);
  });
  return NextResponse.json({ ok: true });
}
