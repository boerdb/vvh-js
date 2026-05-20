import { NextResponse } from "next/server";
import { nevoboTeamResultatenUrl } from "@/lib/constants/nevobo";
import { parseRssItems } from "@/lib/parsers/rss-parse-server";
import { upstreamErrorResponse } from "@/lib/server/api-error";
import { fetchUpstreamText } from "@/lib/server/upstream";

export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    const xml = await fetchUpstreamText(nevoboTeamResultatenUrl(code));
    return NextResponse.json(parseRssItems(xml));
  } catch (error) {
    return upstreamErrorResponse(error);
  }
}
