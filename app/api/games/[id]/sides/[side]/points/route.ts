// app/api/games/[id]/sides/[side]/points/route.ts
import { NextRequest } from "next/server";
import { apiFetch, proxyUpstream } from "@/app/lib/api";

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string; side: "A" | "B" }> }
) {
  const { id, side } = await props.params;

  const upstream = await apiFetch(`/games/${id}/sides/${side}/points`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: await req.text(),
  });

  return proxyUpstream(upstream);
}
