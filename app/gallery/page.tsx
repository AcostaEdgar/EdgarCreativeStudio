import { readStudioState } from "@/lib/studio-state";
import { ArtistHome } from "@/components/artist-home";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Photographs",
  description: "The photographic portfolio of Edgar Acosta.",
  alternates: { canonical: "/gallery" },
};
export default async function Gallery({
  searchParams,
}: {
  searchParams: Promise<{ work?: string }>;
}) {
  const [state, { work }] = await Promise.all([
    readStudioState(),
    searchParams,
  ]);
  return (
    <ArtistHome
      works={state.portfolio}
      hero={state.home.hero}
      initialWork={work}
    />
  );
}
