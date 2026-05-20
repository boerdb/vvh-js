import { NextResponse } from "next/server";
import { nevoboProgrammaUrl } from "@/lib/constants/nevobo";
import { parseRssItems } from "@/lib/parsers/rss-parse-server";
import { upstreamErrorResponse } from "@/lib/server/api-error";
import { fetchUpstreamText } from "@/lib/server/upstream";

export async function GET() {
  try {
    const xml = await fetchUpstreamText(nevoboProgrammaUrl());
    return NextResponse.json(parseRssItems(xml));
  } catch (error) {
    return upstreamErrorResponse(error);
  }
}
