import "server-only";

import { get, put } from "@vercel/blob";
import fs from "node:fs/promises";
import path from "node:path";
import portfolioDefaults from "@/content/portfolio.json";
import homeDefaults from "@/content/home-media.json";
import writingDefaults from "@/content/writing.json";

export type Work = (typeof portfolioDefaults)[number] & {
  physicalWidth?: number;
  physicalHeight?: number;
  physicalDepth?: number;
  unit?: string;
};
export type Media = {
  id: string;
  kind: "image" | "video";
  url: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
  href?: string;
};
export type HomeMedia = {
  hero: Media[];
  feature_video: Media | null;
  collage: Media[];
};
export type StudioState = {
  portfolio: Work[];
  home: HomeMedia;
  writing: typeof writingDefaults;
};

const statePath = "studio/state.json";
export const blobToken = () => process.env.Blob2_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
export const hostedStorageReady = () => Boolean(blobToken());

const defaults = (): StudioState => ({
  portfolio: portfolioDefaults as Work[],
  home: homeDefaults as HomeMedia,
  writing: writingDefaults,
});

async function localState(): Promise<StudioState> {
  if (process.env.VERCEL) return defaults();
  const names = ["portfolio", "home-media", "writing"] as const;
  const [portfolio, home, writing] = await Promise.all(names.map(async name =>
    JSON.parse(await fs.readFile(path.join(process.cwd(), "content", name + ".json"), "utf8"))
  ));
  return { portfolio, home, writing };
}

export async function readStudioState(): Promise<StudioState> {
  const token = blobToken();
  if (!token) return localState();
  const result = await get(statePath, { access: "public", token, useCache: false });
  if (!result || result.statusCode !== 200) return defaults();
  return JSON.parse(await new Response(result.stream).text()) as StudioState;
}

export async function writeStudioState(state: StudioState): Promise<void> {
  const token = blobToken();
  if (token) {
    await put(statePath, JSON.stringify(state), {
      access: "public",
      token,
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 0,
    });
    return;
  }
  if (process.env.VERCEL) throw new Error("Online storage is not connected.");
  await Promise.all([
    fs.writeFile(path.join(process.cwd(), "content/portfolio.json"), JSON.stringify(state.portfolio, null, 2) + "\n"),
    fs.writeFile(path.join(process.cwd(), "content/home-media.json"), JSON.stringify(state.home, null, 2) + "\n"),
    fs.writeFile(path.join(process.cwd(), "content/writing.json"), JSON.stringify(state.writing, null, 2) + "\n"),
  ]);
}
