"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, X, ArrowUpRight } from "lucide-react";
import type { Work } from "@/lib/studio-types";
import { workTitle } from "@/lib/work-labels";
export function EditorialPortfolio({
  works,
  initialWork,
}: {
  works: Work[];
  initialWork?: string;
}) {
  const [selected, setSelected] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const touch = useRef<number | null>(null);
  const current = works[selected];
  function open(index: number) {
    opener.current = document.activeElement as HTMLElement;
    setSelected(index);
    dialog.current?.showModal();
  }
  function close() {
    dialog.current?.close();
    opener.current?.focus({ preventScroll: true });
  }
  useEffect(() => {
    const index = works.findIndex((w) => String(w.id) === initialWork);
    if (index >= 0) {
      const task = setTimeout(() => {
        setSelected(index);
        dialog.current?.showModal();
      }, 0);
      return () => {
        clearTimeout(task);
      };
    }
  }, [initialWork, works]);
  function step(d: number) {
    setSelected((n) => (n + d + works.length) % works.length);
  }
  return (
    <>
      <div className="editorial-grid">
        {works.map((w, i) => (
          <figure key={w.id}>
            <button
              aria-label={
                "View photograph " +
                String(i + 1).padStart(2, "0") +
                (w.title ? ": " + workTitle(w) : "")
              }
              onClick={() => open(i)}
            >
              <Image
                src={w.image}
                alt={w.alt}
                width={w.width}
                height={w.height}
                quality={90}
                sizes="(max-width:700px) 50vw, 25vw"
              />
              <span className="image-open">
                <ArrowUpRight size={24} />
              </span>
            </button>
          </figure>
        ))}
      </div>
      {!works.length && (
        <p className="collection-empty">
          A new selection is taking shape. Please return soon.
        </p>
      )}
      <dialog
        ref={dialog}
        className="art-viewer"
        aria-label="Photograph detail"
        onCancel={close}
        onClose={() => opener.current?.focus({ preventScroll: true })}
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
        {current && (
          <>
            <header>
              <span>EDGAR ACOSTA / PHOTOGRAPHS</span>
              <button onClick={close} aria-label="Close photograph">
                <X size={22} />
              </button>
            </header>
            <div
              className="viewer-image"
              onTouchStart={(e) => {
                touch.current = e.touches[0].clientX;
              }}
              onTouchEnd={(e) => {
                if (touch.current !== null) {
                  const dx = e.changedTouches[0].clientX - touch.current;
                  if (Math.abs(dx) > 65) step(dx > 0 ? -1 : 1);
                }
                touch.current = null;
              }}
            >
              <Image
                key={current.id}
                src={current.image}
                alt={current.alt}
                width={current.width}
                height={current.height}
                quality={95}
                sizes="(max-width:700px) 100vw, 90vw"
                priority
              />
            </div>
            <footer>
              <div className="viewer-meta">
                <span className="kicker">
                  {String(selected + 1).padStart(2, "0")} /{" "}
                  {String(works.length).padStart(2, "0")}
                </span>
                <p>
                  {current.title ? workTitle(current) : "Edgar Acosta"}
                  {current.year ? " · " + current.year : ""}
                </p>
                {current.description && (
                  <p className="viewer-description">{current.description}</p>
                )}
                <a
                  href={
                    "mailto:contact@edgaracosta.com?subject=" +
                    encodeURIComponent(
                      "Print inquiry — " +
                        (current.title ||
                          "Photograph " +
                            String(selected + 1).padStart(2, "0")),
                    ) +
                    "&body=" +
                    encodeURIComponent(
                      "I would like to ask about this work: https://edgaracosta.com/gallery?work=" +
                        current.id,
                    )
                  }
                >
                  Inquire about this work <ArrowUpRight size={13} />
                </a>
              </div>
              <div className="viewer-arrows">
                <button
                  onClick={() => step(-1)}
                  aria-label="Previous photograph"
                >
                  <ArrowLeft />
                </button>
                <button onClick={() => step(1)} aria-label="Next photograph">
                  <ArrowRight />
                </button>
              </div>
            </footer>
          </>
        )}
      </dialog>
    </>
  );
}
