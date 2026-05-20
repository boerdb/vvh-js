const API_TIMEOUT_MS = 25_000;

export async function fetchApiJson<T>(path: string): Promise<T> {
  const res = await fetch(path, {
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`API ${res.status} voor ${path}`);
  }
  return res.json() as Promise<T>;
}
