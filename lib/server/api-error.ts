import { NextResponse } from "next/server";

export function upstreamErrorResponse(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Upstream request mislukt";
  console.error("[api]", message);
  return NextResponse.json({ error: message }, { status: 502 });
}
