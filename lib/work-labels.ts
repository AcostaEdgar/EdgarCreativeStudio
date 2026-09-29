export function workTitle(work: { title: string; year?: string }) {
  const title = work.title?.trim() || "";
  // Legacy camera and import filenames are labels, not artwork titles.
  if (
    !title ||
    /^_?(?:KJ|DSC|IMG)[_\d]/i.test(title) ||
    (/^[A-Za-z\d_-]{13,}$/.test(title) && /\d/.test(title))
  ) {
    return work.year ? `Untitled · ${work.year}` : "Untitled";
  }
  return title;
}
