"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
export function Navigation({ home = false }: { home?: boolean }) {
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className={"studio-navigation " + (home ? "over-hero" : "")}>
        <Link
          className="studio-wordmark"
          href="/"
          aria-label="Edgar Studio home"
        >
          edgar<span>studio</span>
          <ArrowUpRight size={17} />
        </Link>
        <nav aria-label="Main navigation">
          <Link href={home ? "#work" : "/#work"}>Work</Link>
          <Link href={home ? "#contact" : "/#contact"}>
            Contact <ArrowUpRight size={14} />
          </Link>
          <ThemeToggle />
        </nav>
      </header>
    </>
  );
}
