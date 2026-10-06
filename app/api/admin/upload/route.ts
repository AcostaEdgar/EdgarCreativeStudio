import { NextResponse } from "next/server";
import { authorize, publish } from "@/lib/admin-mutation";
import path from "node:path";
import sharp from "sharp";
import crypto from "node:crypto";
import type { Work } from "@/lib/studio-types";
export async function POST(request: Request) {
  const denied = await authorize(request);
  if (denied) return denied;
  if (process.env.VERCEL)
    return NextResponse.json({ error: "Use online uploads." }, { status: 410 });
  try {
    const form = await request.formData();
    const file = form.get("files");
    if (
      !(file instanceof File) ||
      !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(
        file.type,
      ) ||
      file.size > 25 * 1024 * 1024
    )
      throw new Error("Choose a JPEG, PNG, WebP or AVIF image under 25 MB.");
    const id = Date.now() * 1000 + crypto.randomInt(1000);
    const image = "/media/work-" + id + ".webp";
    const info = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize({
        width: 3200,
        height: 3200,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 92 })
      .toFile(path.join(process.cwd(), "public", image));
    const title = String(form.get("title") || "").slice(0, 120);
    const work: Work = {
      id,
      title,
      year: String(form.get("year") || ""),
      medium: "Photography",
      category: String(form.get("category") || "People & place"),
      image,
      width: info.width,
      height: info.height,
      alt: String(form.get("alt") || title || "Photograph by Edgar Acosta"),
      description: String(form.get("description") || ""),
      artist: "Edgar Acosta",
    };
    return publish((state) => {
      const replaceId = Number(form.get("replaceId"));
      if (replaceId) {
        const index = state.portfolio.findIndex((w) => w.id === replaceId);
        if (index < 0)
          throw new Error("The work being replaced no longer exists.");
        const previous = state.portfolio[index];
        state.portfolio[index] = {
          ...previous,
          image,
          width: work.width,
          height: work.height,
          alt: work.alt,
        };
        state.home.hero = state.home.hero.map((m) =>
          m.url === previous.image
            ? {
                ...m,
                url: image,
                width: work.width,
                height: work.height,
                alt: work.alt,
              }
            : m,
        );
        state.home.collage = state.home.collage.filter(
          (m) => m.url !== previous.image,
        );
      } else state.portfolio.push(work);
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed." },
      { status: 400 },
    );
  }
}
