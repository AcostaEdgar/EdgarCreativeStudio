"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUpRight, Pause, Play } from "lucide-react";
import { Navigation } from "./navigation";
import { Footer } from "./footer";
import { EditorialPortfolio } from "./editorial-portfolio";
import { HomeCursor } from "./experience/home-cursor";
import type { Work, Media } from "@/lib/studio-types";
export function ArtistHome({
  works,
  hero,
  initialWork,
}: {
  works: Work[];
  hero: Media[];
  initialWork?: string;
}) {
  const cover = hero.find(
    (m) => m.kind === "image" && works.some((w) => w.image === m.url),
  );
  const source = cover ? { image: cover.url, alt: cover.alt } : works[0];
  const [ready, setReady] = useState(false),
    [entered, setEntered] = useState(Boolean(initialWork)),
    [paused, setPaused] = useState(false);
  const readyRef = useRef(false);
  const stage = useRef<HTMLElement>(null);
  useEffect(() => {
    readyRef.current = ready;
  }, [ready]);
  useEffect(() => {
    const start = performance.now();
    const timer = setInterval(() => {
      if (
        (readyRef.current && performance.now() - start > 900) ||
        performance.now() - start > 2400
      ) {
        setEntered(true);
        clearInterval(timer);
      }
    }, 60);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let frame = 0;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const progress =
        paused || reduced.matches
          ? 0
          : Math.min(1, Math.max(0, -rect.top / (innerHeight * 0.65)));
      el.style.setProperty("--progress", String(progress));
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", scroll, { passive: true });
    addEventListener("resize", scroll);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", scroll);
      removeEventListener("resize", scroll);
    };
  }, [paused]);
  return (
    <div className={paused ? "studio-site motion-paused" : "studio-site"}>
      <HomeCursor paused={paused} />
      <div
        className={"arrival " + (entered ? "has-entered" : "")}
        aria-hidden={entered}
      >
        <span className="arrival-top">EDGAR ACOSTA / PHOTOGRAPHY & ART</span>
        <div className="arrival-emblem" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="arrival-wordmark">
          edgar<span>studio</span>
          <ArrowUpRight aria-hidden="true" />
        </div>
        <div className="arrival-bottom">
          <span>EDGAR STUDIO / SELECTED WORKS</span>
          <button tabIndex={entered ? -1 : 0} onClick={() => setEntered(true)}>
            Enter <ArrowUpRight size={18} />
          </button>
        </div>
        <span className="arrival-rule" />
      </div>
      <Navigation home />
      <main id="main">
        <section className="entrance" ref={stage} aria-label="Edgar Studio">
          <div className="entrance-sticky">
            <div className="entrance-image">
              {source && (
                <Image
                  src={source.image}
                  alt={source.alt}
                  fill
                  sizes="100vw"
                  quality={90}
                  priority
                  onLoad={() => setReady(true)}
                  onError={() => setReady(true)}
                />
              )}
              <div className="entrance-shade" />
              <div className="entrance-title">
                <p>PHOTOGRAPHY / ART / EDGAR ACOSTA</p>
                <h1>
                  edgar<span>studio</span>
                  <ArrowUpRight aria-hidden="true" />
                </h1>
              </div>
              <div className="entrance-bottom">
                <a href="#work">
                  Explore the photographs <ArrowDown size={17} />
                </a>
                <span>SCROLL TO ENTER</span>
                <button
                  aria-label={paused ? "Resume motion" : "Pause motion"}
                  onClick={() => setPaused(!paused)}
                >
                  {paused ? <Play size={15} /> : <Pause size={15} />}
                </button>
              </div>
            </div>
          </div>
        </section>
        <section
          id="work"
          className="contact-sheet"
          aria-label="Photographic portfolio"
        >
          <header className="sheet-heading">
            <span>EDGAR ACOSTA — PHOTOGRAPHS</span>
            <span>{String(works.length).padStart(3, "0")} WORKS</span>
            <a href="#contact">
              Inquiries <ArrowUpRight size={14} />
            </a>
          </header>
          <EditorialPortfolio works={works} initialWork={initialWork} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
