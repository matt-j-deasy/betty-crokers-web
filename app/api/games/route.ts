// app/api/games/route.ts
import { NextRequest } from "next/server";
import { apiFetch, proxyUpstream, proxyJsonEnvelope } from "@/app/lib/api";

export async function GET(req: NextRequest) {
  const upstream = await apiFetch(`/games${req.nextUrl.search}`, { cache: "no-store" });
  return proxyJsonEnvelope(upstream);
}

export async function POST(req: NextRequest) {
  const upstream = await apiFetch("/games", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await req.text(),
  });
  return proxyUpstream(upstream);
}
