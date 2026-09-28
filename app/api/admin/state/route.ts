import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validSession } from "@/lib/admin";
import fs from "node:fs/promises";
import path from "node:path";
export async function GET() {
  if (!validSession((await cookies()).get("edgar_admin")?.value)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [portfolio,home,writing] = await Promise.all(["portfolio","home-media","writing"].map(async name=>JSON.parse(await fs.readFile(path.join(process.cwd(),"content",name+".json"),"utf8"))));
  return NextResponse.json({ portfolio, home, writing }, {headers:{"Cache-Control":"no-store"}});
}
