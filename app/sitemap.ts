import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/gallery", "/writing", "/start"].map((path) => ({
    url: `https://edgaracosta.com${path}`,
    changeFrequency: "weekly",
    priority: path ? 0.8 : 1,
  }));
}
