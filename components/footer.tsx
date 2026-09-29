import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { brand } from "@/lib/brand";
export function Footer() {
  return (
    <footer className="experience-footer">
      <Link className="footer-wordmark" href="/" aria-label={brand.name}>
        edgar<span>studio</span>
        <sup><ArrowUpRight size="1em" aria-hidden="true" /></sup>
      </Link>
      <div>
        <span>© {new Date().getFullYear()} EDGAR ACOSTA</span>
        <span>STRATEGY · COPY · ART DIRECTION · DIGITAL</span>
        <a href={"mailto:" + brand.email}>{brand.email} ↗</a>
        <Link href="/writing">WORDS & IDEAS ↗</Link>
        <Link href="/start">START A PROJECT ↗</Link>
      </div>
    </footer>
  );
}
