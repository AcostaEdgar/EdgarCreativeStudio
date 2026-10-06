import "server-only";
import { get, put, BlobPreconditionFailedError } from "@vercel/blob";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import portfolio from "@/content/portfolio.json";
import home from "@/content/home-media.json";
import writing from "@/content/writing.json";
import type { StudioState, Work, HomeMedia } from "./studio-types";
export type { StudioState, Work, HomeMedia, Media } from "./studio-types";
// The previous studio/state.json collection remains recoverable.
const statePath = "studio/artist-state-v2.json";
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
export async function readStudioState(): Promise<StudioState> {
  const token = blobToken();
  if (token) {
    const result = await get(statePath, {
      access: "public",
      token,
      useCache: false,
    });
    if (!result) return defaults();
    if (result.statusCode !== 200)
      throw new Error("The collection could not be read. Please retry.");
    return {
      ...JSON.parse(await new Response(result.stream).text()),
      revision: result.blob.etag,
    };
  }
  if (process.env.VERCEL) return defaults();
  try {
    return JSON.parse(await fs.readFile(localPath, "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return defaults();
    throw error;
  }
}
export async function writeStudioState(state: StudioState): Promise<void> {
  const token = blobToken();
  const { revision, storage: _storage, ...data } = state;
  void _storage;
  if (token) {
    await put(statePath, JSON.stringify(data), {
      access: "public",
      token,
      contentType: "application/json",
      addRandomSuffix: false,
      cacheControlMaxAge: 0,
      ...(revision && revision !== "new"
        ? { ifMatch: revision, allowOverwrite: true }
        : { allowOverwrite: false }),
    });
    return;
  }
  if (process.env.VERCEL)
    throw new Error("Online image storage is not connected.");
  const temp = localPath + "." + crypto.randomUUID();
  await fs.writeFile(
    temp,
    JSON.stringify({ ...data, revision: crypto.randomUUID() }),
  );
  await fs.rename(temp, localPath);
}
let localQueue: Promise<unknown> = Promise.resolve();
export async function mutateStudioState(
  change: (state: StudioState) => void,
): Promise<StudioState> {
  async function apply() {
    for (let attempt = 0; attempt < 5; attempt++) {
      const state = await readStudioState();
      change(state);
      try {
        await writeStudioState(state);
        return await readStudioState();
      } catch (error) {
        if (
          !(error instanceof BlobPreconditionFailedError) &&
          !(error instanceof Error && /already exists/i.test(error.message))
        )
          throw error;
      }
    }
    throw new Error(
      "The collection is being updated in another window. Please retry.",
    );
  }
  if (blobToken()) return apply();
  const result = localQueue.then(apply);
  localQueue = result.catch(() => {});
  return result;
}
