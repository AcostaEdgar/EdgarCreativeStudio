import crypto from "node:crypto";
import { head } from "@vercel/blob";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sameOrigin, validSession } from "@/lib/admin";
import { blobToken, type Work } from "@/lib/studio-state";
import { publish } from "@/lib/admin-mutation";

export async function POST(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  if (!validSession((await cookies()).get("edgar_admin")?.value))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const token = blobToken();
  if (!token)
    return NextResponse.json(
      { error: "Online storage is not connected." },
      { status: 503 },
    );
  const data = await request.json().catch(() => ({}));
  const { url, width, height } = data;
  if (
    typeof url !== "string" ||
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 1 ||
    height < 1 ||
    width > 20000 ||
    height > 20000
  ) {
    return NextResponse.json(
      { error: "Image details are invalid." },
      { status: 400 },
    );
  }
  let blob;
  try {
    blob = await head(url, { token });
  } catch {
    return NextResponse.json(
      { error: "Uploaded image was not found." },
      { status: 400 },
    );
  }
  if (
    !blob.pathname.startsWith("studio/uploads/") ||
    blob.size > 25 * 1024 * 1024 ||
    !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(
      blob.contentType,
    )
  ) {
    return NextResponse.json(
      { error: "Only supported images under 25 MB can be added." },
      { status: 400 },
    );
  }
  const id = Number(`${Date.now()}${crypto.randomInt(100, 999)}`);
  const title = String(data.title || "")
    .trim()
    .slice(0, 120);
  const alt = String(data.alt || title || "Photograph by Edgar Acosta")
    .trim()
    .slice(0, 220);
  const physicalWidth = Number(data.physicalWidth) || undefined;
  const physicalHeight = Number(data.physicalHeight) || undefined;
  const physicalDepth = Number(data.physicalDepth) || undefined;
  const work: Work = {
    id,
    title,
    year: String(data.year || new Date().getFullYear()).slice(0, 12),
    medium: String(data.medium || "Photography").slice(0, 80),
    category: String(data.category || "People & place").slice(0, 80),
    image: blob.url,
    width,
    height,
    alt,
    description: String(data.description || "").slice(0, 2000),
    artist: "Edgar Acosta",
    ...(physicalWidth ? { physicalWidth } : {}),
    ...(physicalHeight ? { physicalHeight } : {}),
    ...(physicalDepth ? { physicalDepth } : {}),
    unit: ["cm", "in", "mm"].includes(data.unit) ? data.unit : "cm",
  };
  const media = {
    id: String(id),
    kind: "image" as const,
    url: blob.url,
    width,
    height,
    alt,
    caption: title,
  };
  return publish((state) => {
    if (state.portfolio.some((w) => w.image === blob.url)) return;
    if (data.replaceId) {
      const index = state.portfolio.findIndex(
        (w) => w.id === Number(data.replaceId),
      );
      if (index < 0)
        throw new Error("The work being replaced no longer exists.");
      const previous = state.portfolio[index];
      state.portfolio[index] = {
        ...previous,
        image: work.image,
        width,
        height,
        alt: work.alt,
      };
      state.home.hero = state.home.hero.map((m) =>
        m.url === previous.image
          ? { ...m, url: work.image, width, height, alt: work.alt }
          : m,
      );
      state.home.collage = state.home.collage.filter(
        (m) => m.url !== previous.image,
      );
      return;
    }
    state.portfolio.push(work);
    if (data.hero) state.home.hero = [media];
  });
}
