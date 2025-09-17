// app/api/games/[id]/sides/[side]/points/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
const BASE = process.env.GO_SERVER_URL!;
export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string; side: "A"|"B" }> }
) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  const token = (session as any)?.token as string | undefined;
  if (!token || (session as any)?.expired) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const upstream = await fetch(`${BASE}/games/${params.id}/sides/${params.side}/points`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: await req.text(),
  });
  const text = await upstream.text();
  const ct = upstream.headers.get("content-type") ?? "application/json";
  return new NextResponse(text, { status: upstream.status, headers: { "Content-Type": ct } });
}

