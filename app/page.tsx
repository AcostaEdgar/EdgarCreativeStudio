import { readStudioState } from "@/lib/studio-state";
import { ArtistHome } from "@/components/artist-home";
export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const { portfolio, home } = await readStudioState();
  const image = home.hero[0]?.url || portfolio[0]?.image;
  return {
    alternates: { canonical: "/" },
    openGraph: {
      title: "Edgar Acosta — Artist & photographer",
      images: image
        ? [{ url: image, alt: "Selected photograph by Edgar Acosta" }]
        : [],
    },
  };
}
export default async function Home() {
  const state = await readStudioState();
  return <ArtistHome works={state.portfolio} hero={state.home.hero} />;
}
