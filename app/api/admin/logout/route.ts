import { NextResponse } from "next/server";
export async function POST(request: Request) {
  void request;
  const response = NextResponse.json({ ok: true }); response.cookies.delete("edgar_admin"); return response;
}
