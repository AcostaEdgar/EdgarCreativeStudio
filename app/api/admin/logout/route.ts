import { NextResponse } from "next/server";
import { revokeSession } from "@/lib/admin";
export async function POST(request: Request) {
  revokeSession(request.headers.get("cookie")?.match(/(?:^|; )edgar_admin=([^;]+)/)?.[1]);
  const response = NextResponse.json({ ok: true }); response.cookies.delete("edgar_admin"); return response;
}
