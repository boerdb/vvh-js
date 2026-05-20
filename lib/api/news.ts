import { fetchApiJson } from "@/lib/api/fetch-api";
import type { NewsItem } from "@/lib/types/models";

export async function getNews(): Promise<NewsItem[]> {
  return fetchApiJson<NewsItem[]>("/api/news");
}
