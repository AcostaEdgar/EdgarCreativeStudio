import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { readStudioState } from "@/lib/studio-state";
import "@/components/experience/experience.css";
import "@/components/experience/art-direction.css";

export const metadata = {
  title: "Words & ideas",
  description:
    "Notes on art, design, and the decisions that make an idea matter, by Edgar Acosta.",
  alternates: { canonical: "/writing" },
};
export const revalidate = 300;
export default async function Writing() {
  const { writing } = await readStudioState();
  const entries = (writing as { title: string; body: string }[]).filter(
    (entry) => entry.body?.trim(),
  );
  return (
    <div className="studio-page studio-edition">
      <Navigation />
      <main id="main" className="studio-page-main">
        <header className="studio-page-heading">
          <p className="eyebrow">EDGAR ACOSTA / WORDS & IDEAS</p>
          <h1>
            Behind
            <br />
            the feeling.
          </h1>
          <p>
            Notes on looking closer, asking better questions, and giving an idea
            a life of its own.
          </p>
        </header>
        {entries.length ? (
          entries.map((entry, i) => (
            <article key={i} className="studio-writing">
              <p className="eyebrow">
                STUDIO NOTE / {String(i + 1).padStart(2, "0")}
              </p>
              <h2>{entry.title || "A note from the studio"}</h2>
              {entry.body.split(/\n\s*\n/).map((paragraph, j) => (
                <p key={j}>{paragraph}</p>
              ))}
            </article>
          ))
        ) : (
          <div className="studio-empty">
            <p>
              The first studio notes are taking shape.
              <br />
              In the meantime, the work speaks.
            </p>
            <Link className="studio-button" href="/gallery">
              Enter the showroom ↗
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
