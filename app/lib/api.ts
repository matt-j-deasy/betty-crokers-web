import { headers } from "next/headers";

/** Works in RSC, server actions, and route handlers */
export async function getRequestBaseUrl(): Promise<string> {
  // NOTE: headers() is async in your setup
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host");

  // Fallbacks for non-request contexts (e.g., static gen hooks)
  if (!host) {
    return (
      process.env.NEXT_PUBLIC_APP_URL ??
      process.env.NEXTAUTH_URL ??
      "http://localhost:3000"
    );
  }
  return `${proto}://${host}`;
}

type ApiInit = RequestInit;

export async function apiFetch(path: string, init: ApiInit = {}) {
  const base = await getRequestBaseUrl();
  const url = path.startsWith("http")
    ? path
    : `${base}${path.startsWith("/") ? "" : "/"}${path}`;
  return fetch(url, { cache: "no-store", ...init });
}

export async function apiGetJson<T>(path: string, init: ApiInit = {}) {
  const res = await apiFetch(path, init);
  if (!res.ok) {
    // Up to you: throw to trip RSC error boundary, or soft-fail
    throw new Error(`Request failed ${res.status}: ${path}`);
  }
  return (await res.json()) as T;
}
