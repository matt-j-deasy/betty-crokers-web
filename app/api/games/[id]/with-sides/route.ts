// app/api/games/[id]/with-sides/route.ts
import { NextRequest } from "next/server";
import { apiFetch, proxyUpstream } from "@/app/lib/api";

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;

  const upstream = await apiFetch(`/games/${id}/with-sides`, {
    cache: "no-store",
  });

  return proxyUpstream(upstream);
}
