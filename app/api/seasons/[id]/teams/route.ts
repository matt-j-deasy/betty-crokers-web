// app/api/seasons/[id]/teams/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

const BASE = process.env.GO_SERVER_URL!;

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  const token = (session as any)?.token as string | undefined;

  const qs = req.nextUrl.search; // supports ?onlyActive=1 if you want
  const upstream = await fetch(`${BASE}/seasons/${params.id}/teams${qs}`, {
    cache: "no-store",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const text = await upstream.text();
  try {
    const json = JSON.parse(text);
    return NextResponse.json(
      {
        data: json.data ?? json,
        total: json.total ?? (json.data?.length ?? 0),
        page: json.page ?? 1,
        size: json.size ?? (json.data?.length ?? 0),
      },
      { status: upstream.status }
    );
  } catch {
    return new NextResponse(text, {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("content-type") ?? "text/plain" },
    });
  }
}
