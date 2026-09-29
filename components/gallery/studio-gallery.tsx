"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, X, Grid2X2, Box } from "lucide-react";
import { workTitle } from "@/lib/work-labels";
import { Navigation } from "../navigation";
import { Footer } from "../footer";
import { MuseumScene } from "./museum-scene";
import type { Work } from "@/lib/art";
import { brand } from "@/lib/brand";
import "../experience/experience.css";
import "../experience/art-direction.css";
import "./mobile-gallery.css";

export function StudioGallery({
  works,
  initialWork,
}: {
  works: Work[];
  initialWork?: string;
}) {
  const initial = works.findIndex((w) => String(w.id) === initialWork);
  const [view, setView] = useState("space"),
    [selected, setSelected] = useState(Math.max(0, initial)),
    [share, setShare] = useState("");
  const [detailOpen, setDetailOpen] = useState(false),
    [roomFocus, setRoomFocus] = useState<number>();
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const current = works[selected];
  function open(index: number) {
    opener.current = document.activeElement as HTMLElement;
    setSelected(index);
    setDetailOpen(true);
    document.body.style.overflow = "hidden";
    dialog.current?.showModal();
  }
  function step(direction: number) {
    setSelected((s) => (s + direction + works.length) % works.length);
  }
  if (!current)
    return (
      <div className="spatial-world">
        <Navigation />
        <main id="main" className="portfolio-artist">
          <h1>A new collection is taking shape.</h1>
          <Link href="/">Return to the studio ↗</Link>
        </main>
        <Footer />
      </div>
    );
  return (
    <div className="spatial-world portfolio-world studio-edition">
      <Navigation />
      <main id="main">
        <header className="portfolio-heading">
          <div>
            <p className="eyebrow">EDGAR CREATIVE STUDIO / THE SHOWROOM</p>
            <h1>
              Edgar Acosta<span>↗</span>
            </h1>
          </div>
          <div className="portfolio-heading-right">
            <span>
              {String(works.length).padStart(2, "0")} WORKS · ONE WORLD
            </span>
            <a href="#artist">Behind the work ↓</a>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(
                    location.origin + "/gallery",
                  );
                  setShare("Gallery link copied");
                } catch {
                  setShare(
                    "Copy the gallery address from your browser to share.",
                  );
                }
              }}
            >
              Share the gallery ↗
            </button>
            <span role="status">{share}</span>
          </div>
        </header>
        <section
          className="portfolio-experience"
          aria-label="Edgar Acosta portfolio"
        >
          <div className="portfolio-toolbar">
            <span>THE COLLECTION</span>
            <div>
              <button
                aria-pressed={view === "space"}
                onClick={() => setView("space")}
              >
                <Box size={14} /> Space
              </button>
              <button
                aria-pressed={view === "index"}
                onClick={() => setView("index")}
              >
                <Grid2X2 size={14} /> Index
              </button>
            </div>
            <Link href="/#work">Selected work ↗</Link>
          </div>
          {view === "space" && (
            <MuseumScene
              works={works}
              onOpen={open}
              initialIndex={initial >= 0 ? initial : undefined}
              suspended={detailOpen}
              focusIndex={roomFocus}
            />
          )}
          <div className="portfolio-room is-index" hidden={view !== "index"}>
            <div className="portfolio-wall">
              {works.map((work, i) => (
                <button
                  key={work.id}
                  className="portfolio-work"
                  aria-label={`Open ${workTitle(work)}`}
                  onClick={() => open(i)}
                >
                  <span className="portfolio-mount">
                    <Image
                      draggable={false}
                      src={work.image}
                      alt={work.alt}
                      width={work.width}
                      height={work.height}
                      sizes="(max-width:700px) 45vw, 30vw"
                    />
                  </span>
                  <span className="portfolio-label">
                    <span>
                      {String(i + 1).padStart(2, "0")} / {workTitle(work)}
                    </span>
                    <span>{work.year} ↗</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
        <section id="artist" className="portfolio-artist">
          <div>
            <p className="eyebrow">BEHIND THE WORK</p>
            <h2>
              A way of seeing.
              <br />A reason to look closer.
            </h2>
          </div>
          <div>
            <p>
              Photography and painting are where I sharpen my eye. That same
              attention—to tension, composition, and feeling—shapes the brands
              and digital experiences I create.
            </p>
            <p>
              For commissions, collaborations, or a conversation about the work:
            </p>
            <a href={"mailto:" + brand.email}>{brand.email} ↗</a>
          </div>
        </section>
        <dialog
          ref={dialog}
          className="portfolio-dialog"
          aria-label="Artwork detail"
          onClose={() => {
            setDetailOpen(false);
            setRoomFocus(selected);
            document.body.style.overflow = "";
            opener.current?.focus();
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) dialog.current?.close();
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              e.preventDefault();
              step(1);
            }
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              step(-1);
            }
          }}
        >
          <div className="portfolio-detail">
            <button
              className="detail-close"
              autoFocus
              onClick={() => dialog.current?.close()}
            >
              <span>Return to gallery</span>
              <X size={18} />
            </button>
            <Image
              src={current.image}
              alt={current.alt}
              width={current.width}
              height={current.height}
              sizes="90vw"
            />
            <div className="detail-caption">
              <div>
                <p className="eyebrow">
                  {selected + 1} / {works.length} · {current.year}
                </p>
                <h2>{workTitle(current)}</h2>
                <p>{current.medium}</p>
                {current.description && <p>{current.description}</p>}
                <a
                  href={
                    "mailto:" +
                    brand.email +
                    "?subject=" +
                    encodeURIComponent("About " + workTitle(current))
                  }
                >
                  Inquire about this work ↗
                </a>
              </div>
              <div>
                <button aria-label="Previous work" onClick={() => step(-1)}>
                  <ArrowLeft size={20} />
                </button>
                <button aria-label="Next work" onClick={() => step(1)}>
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </dialog>
      </main>
      <Footer />
    </div>
  );
}
