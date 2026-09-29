import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sameOrigin, validSession } from "@/lib/admin";
import { readStudioState, writeStudioState, type HomeMedia } from "@/lib/studio-state";
import { revalidatePath } from "next/cache";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!validSession((await cookies()).get("edgar_admin")?.value)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const state = await readStudioState();
  if (body.home !== undefined) {
    const home = body.home as HomeMedia;
    if (!Array.isArray(home.hero) || home.hero.length < 1 || home.hero.length > 4 ||
        home.hero.some(item => !item.alt?.trim() || !state.portfolio.some(work => work.image === item.url))) {
      return NextResponse.json({ error: "Choose one to four portfolio images for the entrance." }, { status: 400 });
    }
    state.home = { ...state.home, hero: home.hero };
  }
  if (body.writing !== undefined) {
    if (!Array.isArray(body.writing) || body.writing.length > 1 ||
        body.writing.some((item: {title?: string; body?: string}) =>
          typeof item.title !== "string" || typeof item.body !== "string" || item.title.length > 160 || item.body.length > 50000)) {
      return NextResponse.json({ error: "Writing sample is too long or invalid." }, { status: 400 });
    }
    state.writing = body.writing;
  }
  await writeStudioState(state);
  revalidatePath("/");
  revalidatePath("/gallery");
  return NextResponse.json({ ok: true });
}
