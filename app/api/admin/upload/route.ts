import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validSession } from "@/lib/admin";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type portfolioDefaults from "@/content/portfolio.json";
import type homeDefaults from "@/content/home-media.json";

async function save(name: string, value: unknown) { await fs.writeFile(path.join(process.cwd(), "content", name), JSON.stringify(value, null, 2) + "\n"); }
export async function POST(request: Request) {
  if (!validSession((await cookies()).get("edgar_admin")?.value)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData();
  const portfolio: typeof portfolioDefaults = JSON.parse(await fs.readFile(path.join(process.cwd(), "content/portfolio.json"), "utf8"));
  const home: typeof homeDefaults = JSON.parse(await fs.readFile(path.join(process.cwd(), "content/home-media.json"), "utf8"));
  const files = form.getAll("files").filter((value): value is File => value instanceof File);
  if (!files.length) return NextResponse.json({ error: "Choose one or more images." }, { status: 400 });
  const asHero = form.get("hero") === "true";
  const added: Array<Record<string, unknown>> = [];
  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    const id = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const source = Buffer.from(await file.arrayBuffer());
    const meta = await sharp(source).metadata();
    const width = meta.width || 1600, height = meta.height || 1200;
    const url = `/media/work-${id}.webp`;
    await sharp(source).rotate().resize({ width: 2200, withoutEnlargement: true }).webp({ quality: 90 }).toFile(path.join(process.cwd(), "public", url));
    const title = String(form.get("title") || file.name.replace(/\.[^.]+$/, "")).slice(0, 120);
    const physicalWidth = Number(form.get("physicalWidth")) || undefined;
    const physicalHeight = Number(form.get("physicalHeight")) || undefined;
    const physicalDepth = Number(form.get("physicalDepth")) || undefined;
    const unit = String(form.get("unit") || "cm");
    const item = { id: Number(id), title, year: String(form.get("year") || new Date().getFullYear()), medium: String(form.get("medium") || "Image"), image: url, width, height, alt: String(form.get("alt") || title), description: String(form.get("description") || ""), artist: "Edgar Acosta", ...(physicalWidth ? { physicalWidth } : {}), ...(physicalHeight ? { physicalHeight } : {}), ...(physicalDepth ? { physicalDepth } : {}), unit };
    added.push(item); (portfolio as unknown as unknown[]).push(item);
    (home.collage as unknown as unknown[]).push({ id, kind: "image", url, width, height, alt: item.alt, caption: title });
    if (asHero && home.hero.length < 4) home.hero.push({ id, kind: "image", url, width, height, alt: item.alt, caption: title });
  }
  if (!added.length) return NextResponse.json({ error: "Only image files are supported." }, { status: 400 });
  await save("portfolio.json", portfolio); await save("home-media.json", home);
  return NextResponse.json({ added, home });
}
