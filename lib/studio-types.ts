export type Work = {
  id: number;
  title: string;
  year: string;
  medium: string;
  image: string;
  width: number;
  height: number;
  alt: string;
  description: string;
  artist: string;
  category?: string;
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
  writing: { title: string; body: string }[];
  revision?: string;
  storage?: "blob" | "local";
};
