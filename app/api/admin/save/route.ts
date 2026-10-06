import { authorize, publish } from "@/lib/admin-mutation";
import { moveWork } from "@/lib/portfolio-order";
export async function POST(request: Request) {
  const denied = await authorize(request);
  if (denied) return denied;
  const body = await request.json().catch(() => ({}));
  return publish((state) => {
    if (body.move) state.portfolio = moveWork(state.portfolio, body.move);
    if (body.order) {
      if (
        !Array.isArray(body.order) ||
        new Set(body.order).size !== state.portfolio.length ||
        body.order.length !== state.portfolio.length ||
        body.order.some(
          (id: number) => !state.portfolio.some((w) => w.id === id),
        )
      )
        throw new Error("The collection changed. Refresh before reordering.");
      state.portfolio = body.order.map((id: number) =>
        state.portfolio.find((w) => w.id === id)!,
      );
    }
    if (body.work) {
      const w = state.portfolio.find((w) => w.id === body.work.id);
      if (!w) throw new Error("Work not found. Refresh the collection.");
      for (const key of [
        "title",
        "year",
        "medium",
        "alt",
        "description",
        "category",
      ] as const) {
        if (typeof body.work[key] === "string")
          w[key] = body.work[key]
            .trim()
            .slice(0, key === "description" ? 2000 : 220);
      }
      if (!w.alt)
        throw new Error("Add a short image description for accessibility.");
      for (const key of [
        "physicalWidth",
        "physicalHeight",
        "physicalDepth",
      ] as const) {
        const v = Number(body.work[key]);
        w[key] = Number.isFinite(v) && v > 0 ? v : undefined;
      }
      w.unit = ["cm", "in", "mm"].includes(body.work.unit)
        ? body.work.unit
        : "cm";
      state.home.hero = state.home.hero.map((m) =>
        m.url === w.image ? { ...m, alt: w.alt, caption: w.title } : m,
      );
    }
    if (body.heroIds) {
      if (
        !Array.isArray(body.heroIds) ||
        body.heroIds.length > 1 ||
        new Set(body.heroIds).size !== body.heroIds.length
      )
        throw new Error("Choose one hero image.");
      state.home.hero = body.heroIds.map((id: number) => {
        const w = state.portfolio.find((w) => w.id === id);
        if (!w) throw new Error("That image is no longer in the collection.");
        return {
          id: String(w.id),
          kind: "image",
          url: w.image,
          width: w.width,
          height: w.height,
          alt: w.alt,
          caption: w.title,
        };
      });
    }
    if (body.writing) {
      if (
        !Array.isArray(body.writing) ||
        body.writing.length > 1 ||
        body.writing.some(
          (w: { title: string; body: string }) =>
            typeof w.title !== "string" ||
            typeof w.body !== "string" ||
            w.body.length > 50000,
        )
      )
        throw new Error("The writing could not be saved.");
      state.writing = body.writing;
    }
  });
}
