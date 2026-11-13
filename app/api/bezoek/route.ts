import { NextResponse } from "next/server";
import { normaliseerPad } from "@/lib/bezoek/paden";
import { telBezoek } from "@/lib/bezoek/store";

const leeg = () => new NextResponse(null, { status: 204 });

/**
 * POST /api/bezoek { bezoeker?: "app" | "browser", pagina?: string }
 * Anonieme teller: alleen dagtotalen, geen IP-adres of apparaat-ID.
 */
export async function POST(request: Request) {
  try {
    // sendBeacon stuurt text/plain; daarom zelf de JSON lezen
    const body = JSON.parse(await request.text()) as { bezoeker?: unknown; pagina?: unknown };
    const bezoeker =
      body.bezoeker === "app" || body.bezoeker === "browser" ? body.bezoeker : undefined;
    const pagina = normaliseerPad(body.pagina) ?? undefined;
    if (bezoeker || pagina) await telBezoek({ bezoeker, pagina });
  } catch (e) {
    // Tellen mag de app nooit hinderen
    console.error("[bezoek] tellen mislukt", e);
  }
  return leeg();
}
