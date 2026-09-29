import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ProjectBrief } from "@/components/project-brief";
import "@/components/experience/experience.css";
import "@/components/experience/art-direction.css";
export const metadata = {
  title: "Start a project",
  description:
    "Bring the ambition. Build a brand, campaign, or digital experience with Edgar Acosta.",
  alternates: { canonical: "/start" },
};
export default function Start() {
  return (
    <div className="studio-page studio-edition">
      <Navigation />
      <main id="main" className="studio-page-main">
        <header className="studio-page-heading">
          <p className="eyebrow">EDGAR ACOSTA / OPEN A CONVERSATION</p>
          <h1>
            Bring
            <br />
            the ambition.
          </h1>
          <p>
            A sharper identity. A braver campaign. A website that stays with
            you. Let’s find the idea worth going all in on.
          </p>
        </header>
        <ProjectBrief />
      </main>
      <Footer />
    </div>
  );
}
