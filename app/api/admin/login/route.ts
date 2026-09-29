import { NextResponse } from "next/server";
import { adminConfigured, adminHashInfo, checkAdminPassword, clearLoginFailures, createSession, loginAllowed, recordLoginFailure, retryMinutes, sameOrigin } from "@/lib/admin";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!loginAllowed(ip)) return NextResponse.json({ error: `Too many attempts. Try again in ${retryMinutes(ip)} minute${retryMinutes(ip) === 1 ? "" : "s"}.` }, { status: 429 });
  const body = await request.json().catch(() => ({}));
  if (!adminConfigured()) return NextResponse.json({ error: "Owner access is not configured yet." }, { status: 503 });
  if (typeof body.password !== "string" || !await checkAdminPassword(body.password)) {
    recordLoginFailure(ip);
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }
  clearLoginFailures(ip);
  const response = NextResponse.json({ ok: true });
  response.cookies.set("edgar_admin", createSession(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 604800, path: "/" });
  return response;
}
export async function GET() {
  return NextResponse.json(adminHashInfo(), { headers: { "Cache-Control": "no-store" } });
}
