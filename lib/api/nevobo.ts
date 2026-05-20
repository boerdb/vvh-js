import { fetchApiJson } from "@/lib/api/fetch-api";
import type { FeedItem } from "@/lib/types/models";

export async function getProgramma(): Promise<FeedItem[]> {
  return fetchApiJson<FeedItem[]>("/api/programma");
}

export async function getNevoboNieuws(): Promise<FeedItem[]> {
  return fetchApiJson<FeedItem[]>("/api/nevobo-nieuws");
}
