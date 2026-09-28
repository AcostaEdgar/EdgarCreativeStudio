import { NextResponse } from "next/server";
import { adminPassword, createSession } from "@/lib/admin";
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!adminPassword()) return NextResponse.json({ error: "Online editing is not connected yet. Use your local studio workspace to update the collection." }, { status: 503 });
  if (body.password !== adminPassword()) return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set("edgar_admin", createSession(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 604800, path: "/" });
  return response;
}
