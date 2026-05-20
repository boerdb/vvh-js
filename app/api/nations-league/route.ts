import { NextResponse } from "next/server";
import { getNationsLeagueUpcomingDto } from "@/lib/server/nations-league";
import { upstreamErrorResponse } from "@/lib/server/api-error";

export async function GET(request: Request) {
  try {
    const limitParam = new URL(request.url).searchParams.get("limit");
    const limit = limitParam ? Math.min(15, Math.max(1, Number(limitParam))) : 3;
    const items = await getNationsLeagueUpcomingDto(
      Number.isFinite(limit) ? limit : 3
    );
    return NextResponse.json(items);
  } catch (error) {
    return upstreamErrorResponse(error);
  }
}
