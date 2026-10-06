import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
export const metadata = {
  title: "Contact",
  description:
    "Commissions, unique prints, and speaking inquiries. Contact Edgar Acosta.",
  alternates: { canonical: "/start" },
};
export default function Start() {
  return (
    <>
      <Navigation />
      <main id="main">
        <Footer />
      </main>
    </>
  );
}
