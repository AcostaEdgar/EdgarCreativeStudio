"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowUpRight, Grid2X2, Search, X } from "lucide-react";
import { workTitle } from "@/lib/work-labels";
import type { Work } from "@/lib/art";
import "./experience/discover.css";

export function PortfolioTiles({ works }: { works: Work[] }) {
  const [large, setLarge] = useState(false),
    [search, setSearch] = useState(false),
    [query, setQuery] = useState("");
  const [revealed, setRevealed] = useState<number | null>(null);
  const touch = useRef(false);
  const filtered = works.filter((w) =>
    `${workTitle(w)} ${w.medium} ${w.year}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <div
      className={`discover-v2 embedded-gallery ${large ? "gallery-large" : ""}`}
    >
      <div>
        <div className="gallery-topline">
          <span className="eyebrow">03 / SELECTED WORK</span>
          <Link className="back-experience" href="/gallery">
            The 3D showroom <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="gallery-heading">
          <h2>
            SELECTED
            <br />
            <span>WORK.</span>
          </h2>
          <p>
            Photography. Painting. Visual thought.
            <br />
            Follow what holds your attention.
          </p>
        </div>
        <div className="gallery-toolbar">
          <span className="eyebrow">
            {String(filtered.length).padStart(2, "0")} WORKS / EDGAR ACOSTA
          </span>
          <div className="gallery-tools">
            <button
              aria-label={large ? "Show four columns" : "Show larger tiles"}
              aria-pressed={large}
              onClick={() => setLarge(!large)}
            >
              <Grid2X2 size={16} />
            </button>
            <button
              aria-label={search ? "Close search" : "Search works"}
              onClick={() => {
                setSearch(!search);
                setQuery("");
              }}
            >
              {search ? <X size={17} /> : <Search size={17} />}
            </button>
          </div>
        </div>
        {search && (
          <div className="gallery-search">
            <Search size={18} />
            <input
              autoFocus
              aria-label="Search works"
              placeholder="A title, a medium, a year…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        )}
        <div className="worlds-grid">
          {filtered.map((w) => (
            <Link
              key={w.id}
              href={`/gallery?work=${w.id}`}
              aria-label={`Explore ${workTitle(w)} in the showroom`}
              className={`world-tile ${revealed === w.id ? "revealed" : ""}`}
              onPointerDown={(e) => {
                touch.current = e.pointerType === "touch";
              }}
              onClick={(e) => {
                if (touch.current && revealed !== w.id) {
                  e.preventDefault();
                  setRevealed(w.id);
                }
                touch.current = false;
              }}
              onBlur={() => setRevealed(null)}
            >
              <Image
                src={w.image}
                alt={w.alt}
                width={w.width}
                height={w.height}
                sizes={
                  large
                    ? "(max-width:700px) 90vw, 48vw"
                    : "(max-width:700px) 46vw, (max-width:1000px) 45vw, 25vw"
                }
                draggable={false}
              />
              <div className="world-tile-shade" />
              <span className="tile-entry">
                <ArrowUpRight size={23} />
              </span>
              <div className="world-tile-label">
                <span>
                  {w.medium.toUpperCase()} / {w.year}
                </span>
                <h3>{workTitle(w)}</h3>
                <p>
                  Explore in the showroom <ArrowUpRight size={15} />
                </p>
              </div>
            </Link>
          ))}
        </div>
        {!filtered.length && (
          <div className="gallery-empty">
            <h3>No works match that search.</h3>
            <button onClick={() => setQuery("")}>Show all work</button>
          </div>
        )}
        <div className="gallery-colophon">
          <span className="eyebrow">ONE ARTIST / MANY PERSPECTIVES</span>
          <p>Every work. One space.</p>
          <a href="#main" aria-label="Back to top">
            ↑
          </a>
        </div>
        <p className="gallery-note">
          Explore the complete collection in the interactive showroom.{" "}
          <span>On touch, tap to reveal; tap again to enter.</span>
        </p>
      </div>
    </div>
  );
}
