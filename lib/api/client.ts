const PROXY_BASE =
  process.env.NEXT_PUBLIC_PROXY_BASE_URL ??
  "https://weer.benswebradio.nl/proxy.php";

export function proxyUrl(params: Record<string, string>): string {
  const url = new URL(PROXY_BASE);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

export function proxyUrlWithEncodedTarget(targetUrl: string): string {
  return `${PROXY_BASE}?url=${encodeURIComponent(targetUrl)}`;
}

export async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

export async function fetchArrayBuffer(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.arrayBuffer();
}

export async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}
