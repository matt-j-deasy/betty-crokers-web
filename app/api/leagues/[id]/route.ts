// app/api/leagues/[id]/route.ts
import { NextRequest } from "next/server";
import { apiFetch, proxyUpstream } from "@/app/lib/api";

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;

  const upstream = await apiFetch(`/leagues/${id}`, {
    cache: "no-store",
  });

  return proxyUpstream(upstream);
}
