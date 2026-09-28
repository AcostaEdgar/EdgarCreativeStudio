import records from "@/content/portfolio.json";
export type Work = (typeof records)[number] & {
  physicalWidth?: number;
  physicalHeight?: number;
  physicalDepth?: number;
  unit?: string;
};
export const works: Work[] = records;
