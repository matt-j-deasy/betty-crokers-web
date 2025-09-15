// app/api/auth/register/route.ts
import { NextResponse } from "next/server";

const BASE = process.env.GO_SERVER_URL!;

export async function POST(req: Request) {
  const body = await req.text();

  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body
  });

  const text = await res.text();
  const contentType = res.headers.get("content-type") || "application/json";
  return new NextResponse(text, { status: res.status, headers: { "Content-Type": contentType } });
}
