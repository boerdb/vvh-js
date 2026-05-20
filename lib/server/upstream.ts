const REVALIDATE_SECONDS = 300;

export async function fetchUpstreamText(url: string): Promise<string> {
  const res = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS },
    headers: { Accept: "application/xml, text/xml, application/rss+xml, */*" },
  });
  if (!res.ok) {
    throw new Error(`Upstream HTTP ${res.status} voor ${url}`);
  }
  return res.text();
}

export async function fetchUpstreamBuffer(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    throw new Error(`Upstream HTTP ${res.status} voor ${url}`);
  }
  return res.arrayBuffer();
}

export async function fetchUpstreamJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS },
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Upstream HTTP ${res.status} voor ${url}`);
  }
  return res.json() as Promise<T>;
}
