// Pure helpers for versioned collection storage, kept free of the Blob SDK so
// scripts/blob-state-test.mjs can exercise them directly.
export const versionPrefix = "studio/collection/";
export const versionPath = (version: number) =>
  `${versionPrefix}${String(version).padStart(10, "0")}.json`;

/** Absolute URL of a version file in the same store as `storeUrl`. */
export const versionUrl = (storeUrl: string, version: number) =>
  new URL("/" + versionPath(version), storeUrl).toString();

export function parseVersion(pathname: string): number | null {
  const match = /^studio\/collection\/(\d{10})\.json$/.exec(pathname);
  return match ? Number(match[1]) : null;
}

export function newestVersion<B extends { pathname: string }>(
  blobs: B[],
): (B & { version: number }) | null {
  let newest: (B & { version: number }) | null = null;
  for (const blob of blobs) {
    const version = parseVersion(blob.pathname);
    if (version !== null && (!newest || version > newest.version))
      newest = { ...blob, version };
  }
  return newest;
}

/** Version a save should create, given the revision it was based on. */
export function nextVersion(revision: string | undefined) {
  const base = Number(revision);
  return Number.isSafeInteger(base) && base > 0 ? base + 1 : 1;
}

/** URLs of versions older than the newest `keep`, oldest first. */
export function staleVersions(
  blobs: { pathname: string; url: string }[],
  keep: number,
) {
  return blobs
    .map((blob) => ({ url: blob.url, version: parseVersion(blob.pathname) }))
    .filter((b): b is { url: string; version: number } => b.version !== null)
    .sort((a, b) => a.version - b.version)
    .slice(0, -keep || undefined)
    .map((b) => b.url);
}

export const isCreateConflict = (error: unknown) =>
  error instanceof Error && /already exists/i.test(error.message);

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Apply `change` to the latest collection, retrying if another save lands first. */
export async function mutateLatest<T>(
  read: () => Promise<T>,
  write: (state: T) => Promise<T>,
  change: (state: T) => void,
  isConflict: (error: unknown) => boolean,
): Promise<T> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const state = await read();
    change(state);
    try {
      // Return the acknowledged write, never an immediately reread copy.
      return await write(state);
    } catch (error) {
      if (!isConflict(error)) throw error;
      await delay(Math.min(1500, 60 * 2 ** attempt) + Math.random() * 60);
    }
  }
  throw new Error(
    "The save could not finish. Please retry; your existing collection is safe.",
  );
}
