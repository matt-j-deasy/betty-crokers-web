type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type ApiInit = Omit<RequestInit, "headers" | "method"> & {
  method?: HttpMethod;
  headers?: Record<string, string>;
  auth?: boolean; // default: true
};

// Detect runtime
const isServer = () => typeof window === "undefined";

// Pick base for current runtime
function getApiBase() {
  const base = isServer() ? process.env.SERVER_API_BASE : process.env.NEXT_PUBLIC_API_BASE;
  if (!base?.startsWith("http")) throw new Error(`Bad API base: ${base}`);
  return base.replace(/\/+$/, "");
}

// --- Auth header helpers (server vs client) ---

async function getAuthHeaderServer(): Promise<Record<string, string>> {
  // Only import next-auth server on the server
  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("@/app/lib/auth");
  const session = await getServerSession(authOptions as any);
  const token = (session as any)?.token as string | undefined;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function getAuthHeaderClient(): Promise<Record<string, string>> {
  // Only import next-auth/react on the client
  const { getSession } = await import("next-auth/react");
  const session = await getSession();
  const token = (session as any)?.token as string | undefined;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function getAuthHeader(): Promise<Record<string, string>> {
  return isServer() ? getAuthHeaderServer() : getAuthHeaderClient();
}

// --- Core fetchers ---

export async function apiFetch(
  path: string,
  init: ApiInit = {}
): Promise<Response> {
  const { method = "GET", headers = {}, auth = true, ...rest } = init;
  const base = getApiBase();
  const url = path.startsWith("http")
    ? path
    : `${base}${path.startsWith("/") ? path : `/${path}`}`;

  const authHeader = auth ? await getAuthHeader() : {};

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", ...authHeader, ...headers },
    // You can override cache per call site
    ...rest,
  });

  return res;
}

export async function apiGetJson<T>(
  path: string,
  init: Omit<ApiInit, "method"> = {}
): Promise<T> {
  const res = await apiFetch(path, { ...init, method: "GET" });
  const text = await res.text();

  // Attempt JSON; if not JSON, throw with body for diagnostics
  try {
    const json = JSON.parse(text);
    if (!res.ok) {
      const msg = json?.message || json?.error || res.statusText;
      throw new Error(`GET ${path} failed: ${res.status} ${msg}`);
    }
    return json as T;
  } catch {
    if (!res.ok) {
      throw new Error(
        `GET ${path} failed: ${res.status} ${res.statusText} — ${text.slice(0, 500)}`
      );
    }
    throw new Error(`GET ${path} returned non-JSON: ${text.slice(0, 500)}`);
  }
}

export async function apiJson<T>(
  path: string,
  body: unknown,
  init: Omit<ApiInit, "method" | "body"> = {}
): Promise<T> {
  const method = "POST";
  const res = await apiFetch(path, {
    ...init,
    method,
    body: body == null ? undefined : JSON.stringify(body),
  });

  const text = await res.text();
  try {
    const json = JSON.parse(text);
    if (!res.ok) {
      const msg = json?.message || json?.error || res.statusText;
      throw new Error(`${method} ${path} failed: ${res.status} ${msg}`);
    }
    return json as T;
  } catch {
    if (!res.ok) {
      throw new Error(
        `${method} ${path} failed: ${res.status} ${res.statusText} — ${text.slice(0, 500)}`
      );
    }
    throw new Error(`${method} ${path} returned non-JSON: ${text.slice(0, 500)}`);
  }
}

import { NextResponse } from "next/server";

/**
 * Turn an upstream Response into a NextResponse,
 * preserving status and content-type.
 */
export async function proxyUpstream(upstream: Response): Promise<NextResponse> {
  const text = await upstream.text();
  const ct = upstream.headers.get("content-type") ?? "application/json";

  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": ct },
  });
}

export async function proxyJsonEnvelope(upstream: Response): Promise<NextResponse> {
  const text = await upstream.text();

  try {
    const json = JSON.parse(text);
    const payload = {
      data: json.data ?? json,
      total: json.total ?? (json.data?.length ?? 0),
      page: json.page ?? 1,
      size: json.size ?? (json.data?.length ?? 0),
    };
    return NextResponse.json(payload, { status: upstream.status });
  } catch {
    // Non-JSON fallback: pass through as text/plain (or original content-type if present)
    const ct = upstream.headers.get("content-type") ?? "text/plain";
    return new NextResponse(text, { status: upstream.status, headers: { "Content-Type": ct } });
  }
}