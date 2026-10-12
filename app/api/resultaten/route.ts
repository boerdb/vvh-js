import { NextResponse } from "next/server";
import { upstreamErrorResponse } from "@/lib/server/api-error";
import { fetchClubResultaten } from "@/lib/server/club-feeds";

export async function GET() {
  try {
    return NextResponse.json(await fetchClubResultaten());
  } catch (error) {
    return upstreamErrorResponse(error);
  }
}
