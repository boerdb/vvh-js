import { fetchApiJson } from "@/lib/api/fetch-api";
import type { FeedItem, StandenResult } from "@/lib/types/models";

export async function getTeamProgramma(teamCode: string): Promise<FeedItem[]> {
  return fetchApiJson<FeedItem[]>(
    `/api/team/${encodeURIComponent(teamCode.toUpperCase())}/programma`
  );
}

export async function getTeamResultaten(teamCode: string): Promise<FeedItem[]> {
  return fetchApiJson<FeedItem[]>(
    `/api/team/${encodeURIComponent(teamCode.toUpperCase())}/resultaten`
  );
}

export async function getStanden(teamCode: string): Promise<StandenResult> {
  return fetchApiJson<StandenResult>(
    `/api/standen?team=${encodeURIComponent(teamCode.toUpperCase())}`
  );
}
