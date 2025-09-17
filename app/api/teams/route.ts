import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

const BASE = process.env.GO_SERVER_URL!;

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const token = (session as any)?.token as string | undefined;

  const upstream = await fetch(`${BASE}/teams${req.nextUrl.search}`, {
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

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const token = (session as any)?.token as string | undefined;

  if (!token || (session as any)?.expired) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const upstream = await fetch(`${BASE}/teams`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: await req.text(),
  });

  const text = await upstream.text();
  const ct = upstream.headers.get("content-type") ?? "application/json";
  return new NextResponse(text, { status: upstream.status, headers: { "Content-Type": ct } });
}
