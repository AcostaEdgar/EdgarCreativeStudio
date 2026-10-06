import { authorize, publish } from "@/lib/admin-mutation";
export async function POST(request: Request) {
  const denied = await authorize(request);
  if (denied) return denied;
  const body = await request.json().catch(() => ({}));
  return publish((state) => {
    const work = state.portfolio.find((w) => String(w.id) === String(body.id));
    if (!work) return;
    state.portfolio = state.portfolio.filter((w) => w.id !== work.id);
    const keep = (m: { id: string; url: string }) =>
      String(m.id) !== String(work.id) && m.url !== work.image;
    state.home.hero = state.home.hero.filter(keep);
    state.home.collage = state.home.collage.filter(keep);
  });
}
