// app/api/seasons/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

const BASE = process.env.GO_SERVER_URL!;

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const token = (session as any)?.token as string | undefined;

  const upstream = await fetch(`${BASE}/seasons/${params.id}`, {
    cache: "no-store",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const text = await upstream.text();
  const ct = upstream.headers.get("content-type") ?? "application/json";
  return new NextResponse(text, { status: upstream.status, headers: { "Content-Type": ct } });
}
