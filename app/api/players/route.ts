import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

const BASE = process.env.GO_SERVER_URL!;

export async function GET() {
  const session = await getServerSession(authOptions);
  const token = (session as any)?.token;

  const res = await fetch(`${BASE}/players`, {
    headers: { Authorization: token ? `Bearer ${token}` : "" }
  });

  const body = await res.text();
  return new NextResponse(body, { status: res.status, headers: { "Content-Type": res.headers.get("content-type") || "application/json" } });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = (session as any).token;
  const res = await fetch(`${BASE}/players`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: await req.text()
  });

  const body = await res.text();
  return new NextResponse(body, { status: res.status, headers: { "Content-Type": res.headers.get("content-type") || "application/json" } });
}
