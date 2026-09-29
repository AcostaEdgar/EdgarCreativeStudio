import { HomeExperience } from "@/components/experience/home-experience";
import { readStudioState } from "@/lib/studio-state";
export const metadata = { alternates: {canonical: "/"} };
export const revalidate = 300;
export default async function Home() {
  const { home, portfolio } = await readStudioState();
  return <HomeExperience slots={home} works={portfolio} />;
}
