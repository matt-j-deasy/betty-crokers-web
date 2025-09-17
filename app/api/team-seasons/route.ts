// app/api/team-seasons/route.ts
import { NextRequest } from "next/server";
import { apiFetch, proxyUpstream } from "@/app/lib/api";

export async function POST(req: NextRequest) {
  const upstream = await apiFetch("/team-seasons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await req.text(),
  });

  return proxyUpstream(upstream);
}
