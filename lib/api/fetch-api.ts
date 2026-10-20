const API_TIMEOUT_MS = 25_000;

/**
 * Wanneer de server een antwoord maakte (Date-header). Blijft ook bewaard als
 * de service worker offline een opgeslagen antwoord teruggeeft.
 */
const fetchedAtByData = new WeakMap<object, Date>();

export function getFetchedAt(data: unknown): Date | null {
  return data && typeof data === "object"
    ? fetchedAtByData.get(data) ?? null
    : null;
}

export async function fetchApiJson<T>(path: string): Promise<T> {
  const res = await fetch(path, {
    cache: "no-store",
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`API ${res.status} voor ${path}`);
  }
  const data = (await res.json()) as T;
  const header = res.headers.get("date");
  const fetchedAt = header ? new Date(header) : null;
  if (data && typeof data === "object" && fetchedAt && !Number.isNaN(fetchedAt.getTime())) {
    fetchedAtByData.set(data, fetchedAt);
  }
  return data;
}
