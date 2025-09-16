// app/api/players/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

const BASE = process.env.GO_SERVER_URL!; // http://localhost:8080/api/v1

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const token = (session as any)?.token as string | undefined;

  const upstream = await fetch(`${BASE}/players${req.nextUrl.search}`, {
    cache: "no-store",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const text = await upstream.text();
  // If upstream is JSON, normalize here:
  try {
    const json = JSON.parse(text);
    // Ensure consistent shape back to the UI
    return NextResponse.json(
      {
        data: json.data ?? json, // fallback if upstream already returns array
        total: json.total ?? (json.data?.length ?? 0),
        page: json.page ?? 1,
        size: json.size ?? (json.data?.length ?? 0),
      },
      { status: upstream.status }
    );
  } catch {
    // Fallback passthrough (non-JSON error bodies)
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

  const upstream = await fetch(`${BASE}/players`, {
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