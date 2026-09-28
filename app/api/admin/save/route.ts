import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validSession } from "@/lib/admin";
import fs from "node:fs/promises"; import path from "node:path";
export async function POST(request: Request) {
  if (!validSession((await cookies()).get("edgar_admin")?.value)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  for (const key of ["portfolio", "home", "writing"]) if (body[key] !== undefined) await fs.writeFile(path.join(process.cwd(), "content", `${key === "home" ? "home-media" : key}.json`), JSON.stringify(body[key], null, 2) + "\n");
  return NextResponse.json({ ok: true });
}
