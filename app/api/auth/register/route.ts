// app/api/auth/register/route.ts
import { apiFetch, proxyUpstream } from "@/app/lib/api";

export async function POST(req: Request) {
  const body = await req.text();

  const upstream = await apiFetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    auth: false, // registration usually doesn't need an auth token
  });

  return proxyUpstream(upstream);
}
