const REVALIDATE_SECONDS = 60;
/** Nevobo hangt soms; liever snel een 502 dan een minuut wachten. */
const UPSTREAM_TIMEOUT_MS = 10_000;

async function fetchUpstream(url: string, accept?: string): Promise<Response> {
  const res = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    headers: accept ? { Accept: accept } : undefined,
  });
  if (!res.ok) {
    throw new Error(`Upstream HTTP ${res.status} voor ${url}`);
  }
  return res;
}

export async function fetchUpstreamText(url: string): Promise<string> {
  const res = await fetchUpstream(
    url,
    "application/xml, text/xml, application/rss+xml, */*"
  );
  return res.text();
}

export async function fetchUpstreamBuffer(url: string): Promise<ArrayBuffer> {
  const res = await fetchUpstream(url);
  return res.arrayBuffer();
}

export async function fetchUpstreamJson<T>(url: string): Promise<T> {
  const res = await fetchUpstream(url, "application/json");
  return res.json() as Promise<T>;
}
