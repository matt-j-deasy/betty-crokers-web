// app/api/seasons/route.ts
import { NextRequest } from "next/server";
import { apiFetch, proxyJsonEnvelope, proxyUpstream } from "@/app/lib/api";

export async function GET(req: NextRequest) {
  const upstream = await apiFetch(`/seasons${req.nextUrl.search}`, {
    cache: "no-store",
  });
  return proxyJsonEnvelope(upstream);
}

export async function POST(req: NextRequest) {
  const upstream = await apiFetch("/seasons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await req.text(),
  });
  return proxyUpstream(upstream);
}
