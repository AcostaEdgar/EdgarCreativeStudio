import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sameOrigin, validSession } from "@/lib/admin";
import { readStudioState, writeStudioState } from "@/lib/studio-state";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!validSession((await cookies()).get("edgar_admin")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const id = Number(body.id);
  if (!Number.isSafeInteger(id)) return NextResponse.json({ error: "A valid work id is required." }, { status: 400 });

  const state = await readStudioState();
  const work = state.portfolio.find((item) => item.id === id);
  if (!work) return NextResponse.json({ error: "Work not found." }, { status: 404 });
  const nextPortfolio = state.portfolio.filter((item) => item.id !== id);
  const sameId = (value: string | number | undefined) => String(value) === String(id);
  const nextHome = {
    ...state.home,
    hero: state.home.hero.filter((item) => !sameId(item.id)),
    collage: state.home.collage.filter((item) => !sameId(item.id)),
  };
  state.portfolio = nextPortfolio;
  state.home = { ...nextHome, hero: nextHome.hero.length ? nextHome.hero : state.home.hero.filter(item => item.url !== work.image) };
  await writeStudioState(state);
  revalidatePath("/");
  revalidatePath("/gallery");
  return NextResponse.json({ ok: true, id, portfolio: nextPortfolio, home: nextHome });
}
