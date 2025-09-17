// app/api/teams/route.ts
import { apiFetch, proxyUpstream } from "@/app/lib/api";

export async function GET() {
  const upstream = await apiFetch("/teams", { cache: "no-store" });
  return proxyUpstream(upstream);
}

export async function POST(req: Request) {
  const upstream = await apiFetch("/teams", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await req.text(),
  });
  return proxyUpstream(upstream);
}
