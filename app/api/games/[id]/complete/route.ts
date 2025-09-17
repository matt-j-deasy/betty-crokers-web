// app/api/games/[id]/complete/route.ts
import { NextRequest } from "next/server";
import { apiFetch, proxyUpstream } from "@/app/lib/api";

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;

  const upstream = await apiFetch(`/games/${id}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await req.text(), // expects { "winnerSide": "A" | "B" }
  });

  return proxyUpstream(upstream);
}
