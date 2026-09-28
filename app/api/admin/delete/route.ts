import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validSession } from "@/lib/admin";
import fs from "node:fs/promises";
import path from "node:path";

type Work = { id: number; image?: string };
type Home = { hero: Array<{ id?: string | number }>; collage: Array<{ id?: string | number }> };

async function readJson<T>(name: string): Promise<T> {
  return JSON.parse(await fs.readFile(path.join(process.cwd(), "content", name), "utf8")) as T;
}

async function writeJson(name: string, value: unknown) {
  await fs.writeFile(path.join(process.cwd(), "content", name), JSON.stringify(value, null, 2) + "\n");
}

export async function POST(request: Request) {
  if (!validSession((await cookies()).get("edgar_admin")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const id = Number(body.id);
  if (!Number.isSafeInteger(id)) return NextResponse.json({ error: "A valid work id is required." }, { status: 400 });

  const portfolio = await readJson<Work[]>("portfolio.json");
  const work = portfolio.find((item) => item.id === id);
  if (!work) return NextResponse.json({ error: "Work not found." }, { status: 404 });

  const nextPortfolio = portfolio.filter((item) => item.id !== id);
  const home = await readJson<Home>("home-media.json");
  const sameId = (value: string | number | undefined) => String(value) === String(id);
  const nextHome = {
    ...home,
    hero: home.hero.filter((item) => !sameId(item.id)),
    collage: home.collage.filter((item) => !sameId(item.id)),
  };

  await writeJson("portfolio.json", nextPortfolio);
  await writeJson("home-media.json", nextHome);

  if (work.image?.startsWith("/media/") && !work.image.includes("..") && !nextPortfolio.some(item=>item.image===work.image)) {
    await fs.rm(path.join(process.cwd(), "public", work.image), { force: true });
  }

  return NextResponse.json({ ok: true, id, portfolio: nextPortfolio, home: nextHome });
}
