import crypto from "node:crypto";
import { head } from "@vercel/blob";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { sameOrigin, validSession } from "@/lib/admin";
import { blobToken, readStudioState, writeStudioState, type Work } from "@/lib/studio-state";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!validSession((await cookies()).get("edgar_admin")?.value)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const token = blobToken();
  if (!token) return NextResponse.json({ error: "Online storage is not connected." }, { status: 503 });
  const data = await request.json().catch(() => ({}));
  const { url, width, height } = data;
  if (typeof url !== "string" || !Number.isInteger(width) || !Number.isInteger(height) ||
      width < 1 || height < 1 || width > 20000 || height > 20000) {
    return NextResponse.json({ error: "Image details are invalid." }, { status: 400 });
  }
  let blob;
  try { blob = await head(url, { token }); }
  catch { return NextResponse.json({ error: "Uploaded image was not found." }, { status: 400 }); }
  if (!blob.pathname.startsWith("studio/uploads/") || blob.size > 25 * 1024 * 1024 ||
      !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(blob.contentType)) {
    return NextResponse.json({ error: "Only supported images under 25 MB can be added." }, { status: 400 });
  }
  const state = await readStudioState();
  if (state.portfolio.some(work => work.image === blob.url)) return NextResponse.json({ error: "Image is already in the portfolio." }, { status: 409 });
  const id = Number(`${Date.now()}${crypto.randomInt(100, 999)}`);
  const filename = String(data.filename || "Untitled").replace(/\.[^.]+$/, "");
  const title = String(data.title || filename || "Untitled").trim().slice(0, 120) || "Untitled";
  const alt = String(data.alt || title).trim().slice(0, 220);
  const physicalWidth = Number(data.physicalWidth) || undefined;
  const physicalHeight = Number(data.physicalHeight) || undefined;
  const physicalDepth = Number(data.physicalDepth) || undefined;
  const work: Work = {
    id, title, year: String(data.year || new Date().getFullYear()).slice(0, 12),
    medium: String(data.medium || "Image").slice(0, 80),
    image: blob.url, width, height, alt,
    description: String(data.description || "").slice(0, 2000), artist: "Edgar Acosta",
    ...(physicalWidth ? { physicalWidth } : {}),
    ...(physicalHeight ? { physicalHeight } : {}),
    ...(physicalDepth ? { physicalDepth } : {}),
    unit: ["cm", "in", "mm"].includes(data.unit) ? data.unit : "cm",
  };
  const media = { id: String(id), kind: "image" as const, url: blob.url, width, height, alt, caption: title };
  state.portfolio.push(work);
  state.home.collage.push(media);
  if (data.hero && state.home.hero.length < 4) state.home.hero.push(media);
  await writeStudioState(state);
  revalidatePath("/");
  revalidatePath("/gallery");
  return NextResponse.json({ added: [work], home: state.home });
}
