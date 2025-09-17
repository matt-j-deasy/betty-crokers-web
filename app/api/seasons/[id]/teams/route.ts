// app/api/seasons/[id]/teams/route.ts
import { NextRequest } from "next/server";
import { apiFetch, proxyJsonEnvelope } from "@/app/lib/api";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;

  const qs = req.nextUrl.search; // supports ?onlyActive=1 if needed
  const upstream = await apiFetch(`/seasons/${id}/teams${qs}`, {
    cache: "no-store",
  });

  return proxyJsonEnvelope(upstream);
}
