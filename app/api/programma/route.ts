import { NextResponse } from "next/server";
import { upstreamErrorResponse } from "@/lib/server/api-error";
import { fetchClubProgramma } from "@/lib/server/club-feeds";

export async function GET() {
  try {
    return NextResponse.json(await fetchClubProgramma());
  } catch (error) {
    return upstreamErrorResponse(error);
  }
}
