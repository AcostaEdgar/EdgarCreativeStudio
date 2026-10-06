import type { Work } from "./studio-types";

export function moveWork(
  works: Work[],
  move: { id: number; beforeId: number | null; position: number },
) {
  if (
    !Number.isSafeInteger(move.id) ||
    !Number.isInteger(move.position) ||
    move.position < 0 ||
    (move.beforeId !== null && !Number.isSafeInteger(move.beforeId))
  ) {
    throw new Error("Choose a valid image position.");
  }
  const work = works.find((w) => w.id === move.id);
  if (!work)
    throw new Error(
      "This photograph has already been removed. Refresh to see the latest collection.",
    );
  const remaining = works.filter((w) => w.id !== move.id);
  const anchor =
    move.beforeId === null
      ? remaining.length
      : remaining.findIndex((w) => w.id === move.beforeId);
  remaining.splice(
    anchor < 0 ? Math.min(move.position, remaining.length) : anchor,
    0,
    work,
  );
  return remaining;
}
