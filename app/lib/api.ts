import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

const BASE = process.env.GO_SERVER_URL!;

type FetchOptions = Omit<RequestInit, "headers"> & { headers?: Record<string, string> };

export async function serverFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const session = await getServerSession(authOptions);
  const token = (session as any)?.token as string | undefined;

  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {})
    },
    // SSR fetch with caching disabled by default for freshness
    cache: "no-store"
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// Client-side fetcher for SWR (token provided by NextAuth session route cookie)
export async function clientFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) }
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}
