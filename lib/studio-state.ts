import "server-only";
import { del, head, list, put, BlobNotFoundError } from "@vercel/blob";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import portfolio from "@/content/portfolio.json";
import home from "@/content/home-media.json";
import writing from "@/content/writing.json";
import type { StudioState, Work, HomeMedia } from "./studio-types";
import {
  isCreateConflict,
  mutateLatest,
  nextVersion,
  newestVersion,
  staleVersions,
  versionPath,
  versionPrefix,
} from "./blob-state";
export type { StudioState, Work, HomeMedia, Media } from "./studio-types";

// Every save is a new, never-overwritten file (studio/collection/0000000042.json),
// so the CDN can never hand back an older copy and two saves can't both win.
// studio/artist-state-v2.json is still updated as a fast copy for public pages
// and is the seed the first time versioned storage is used. The older
// studio/state.json collection remains recoverable.
const publicPath = "studio/artist-state-v2.json";
const keepVersions = 25;
const localPath = path.join(process.cwd(), ".artist-state.json");
export const blobToken = () =>
  process.env.Blob2_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
export const hostedStorageReady = () => Boolean(blobToken());
const defaults = (): StudioState =>
  structuredClone({
    portfolio: portfolio as Work[],
    home: home as HomeMedia,
    writing,
    revision: "new",
  });

async function download(url: string): Promise<StudioState> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok)
    throw new Error("The collection could not be read. Please retry.");
  return response.json();
}

async function listVersions(token: string) {
  const blobs: { pathname: string; url: string }[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: versionPrefix, token, cursor });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return blobs;
}

async function versionExists(token: string, version: number) {
  return head(versionPath(version), { token }).then(
    (meta) => meta,
    (error) => {
      if (error instanceof BlobNotFoundError) return null;
      throw error;
    },
  );
}

// The public copy carries the version it mirrors in its content type, which
// head() reads from storage directly. Pages then load that immutable version
// file, so visitors always see the latest save without listing every version.
async function readPublicCopy(token: string): Promise<StudioState | null> {
  let meta;
  try {
    meta = await head(publicPath, { token });
  } catch (error) {
    if (error instanceof BlobNotFoundError) return null;
    throw error;
  }
  const version = Number(/version=(\d+)/.exec(meta.contentType)?.[1]);
  if (Number.isSafeInteger(version) && version > 0) {
    // Two near-simultaneous saves can leave the copy one version behind.
    if (await versionExists(token, version + 1)) return null;
    const exact = new URL(versionPath(version), meta.url).toString();
    return { ...(await download(exact)), revision: String(version) };
  }
  const url = new URL(meta.url);
  url.searchParams.set("v", meta.etag.replace(/\W/g, ""));
  return download(url.toString());
}

/**
 * Current collection. Public pages use the fast copy; admin reads and every
 * save use the authoritative version list (`fresh`).
 */
export async function readStudioState(
  { fresh = false }: { fresh?: boolean } = {},
): Promise<StudioState> {
  const token = blobToken();
  if (token) {
    if (!fresh) {
      const copy = await readPublicCopy(token);
      if (copy) return copy;
    }
    let latest = newestVersion(await listVersions(token));
    // A just-finished save can take a moment to appear in list(); head() sees it.
    for (let probe = 0; probe < 5; probe++) {
      const version = (latest?.version ?? 0) + 1;
      const next = await versionExists(token, version);
      if (!next) break;
      latest = { pathname: next.pathname, url: next.url, version };
    }
    if (latest) {
      const data = await download(latest.url);
      return { ...data, revision: String(latest.version) };
    }
    const legacy = await readPublicCopy(token);
    // Before the first versioned save, the public copy is the collection.
    return legacy ? { ...legacy, revision: "new" } : defaults();
  }
  if (process.env.VERCEL) return defaults();
  try {
    return JSON.parse(await fs.readFile(localPath, "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return defaults();
    throw error;
  }
}

export async function writeStudioState(
  state: StudioState,
): Promise<StudioState> {
  const token = blobToken();
  const { revision, storage: _storage, ...data } = state;
  void _storage;
  if (token) {
    const version = nextVersion(revision);
    const body = JSON.stringify(data);
    // Fails with "already exists" if another save took this version first.
    await put(versionPath(version), body, {
      access: "public",
      token,
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: false,
      cacheControlMaxAge: 31536000,
    });
    await put(publicPath, body, {
      access: "public",
      token,
      contentType: `application/json; version=${version}`,
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 0,
    });
    if (version % 10 === 0) {
      const old = staleVersions(await listVersions(token), keepVersions);
      if (old.length) await del(old, { token }).catch(() => {});
    }
    return { ...data, revision: String(version) };
  }
  if (process.env.VERCEL)
    throw new Error("Online image storage is not connected.");
  const temp = localPath + "." + crypto.randomUUID();
  const saved = { ...data, revision: crypto.randomUUID() };
  await fs.writeFile(temp, JSON.stringify(saved));
  await fs.rename(temp, localPath);
  return saved;
}

let localQueue: Promise<unknown> = Promise.resolve();
export async function mutateStudioState(
  change: (state: StudioState) => void,
): Promise<StudioState> {
  const apply = () =>
    mutateLatest(
      () => readStudioState({ fresh: true }),
      writeStudioState,
      change,
      isCreateConflict,
    );
  if (blobToken()) return apply();
  const result = localQueue.then(apply);
  localQueue = result.catch(() => {});
  return result;
}
