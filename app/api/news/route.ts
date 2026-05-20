import { NextResponse } from "next/server";
import { VVH_NEWS_URL } from "@/lib/constants/nevobo";
import { upstreamErrorResponse } from "@/lib/server/api-error";
import { fetchUpstreamJson } from "@/lib/server/upstream";
import type { NewsItem, WordPressPost } from "@/lib/types/models";

export async function GET() {
  try {
    const posts = await fetchUpstreamJson<WordPressPost[]>(VVH_NEWS_URL);
    const items: NewsItem[] = posts.map((post) => ({
      titel: post.title?.rendered ?? "Geen titel",
      datum: post.date ?? "",
      omschrijving: post.excerpt?.rendered ?? "",
      link: post.link ?? "",
      image:
        post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
        "/default-news.svg",
    }));
    return NextResponse.json(items);
  } catch (error) {
    return upstreamErrorResponse(error);
  }
}
