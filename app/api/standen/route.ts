import { NextResponse } from "next/server";
import { nevoboStandenUrl } from "@/lib/constants/nevobo";
import { parseStandenFromBuffer } from "@/lib/parsers/standen-xlsx";
import { upstreamErrorResponse } from "@/lib/server/api-error";
import { fetchUpstreamBuffer } from "@/lib/server/upstream";

export async function GET(request: Request) {
  try {
    const team = new URL(request.url).searchParams.get("team");
    if (!team) {
      return NextResponse.json(
        { error: "Queryparameter team is verplicht" },
        { status: 400 }
      );
    }
    const buffer = await fetchUpstreamBuffer(nevoboStandenUrl());
    return NextResponse.json(parseStandenFromBuffer(buffer, team));
  } catch (error) {
    return upstreamErrorResponse(error);
  }
}
