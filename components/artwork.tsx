"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { X, ZoomIn, Minus, Plus } from "lucide-react";
import type { Work } from "@/lib/art";
export function Artwork({ work: w }: { work: Work }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [zoom, setZoom] = useState(1);
  return (
    <>
      <button
        className="artwork-stage"
        aria-label={`Enlarge ${w.title}`}
        onClick={() => {
          setZoom(1);
          dialog.current?.showModal();
        }}
      >
        <Image
          unoptimized
          src={w.image}
          alt={w.alt}
          width={w.width}
          height={w.height}
          priority
          sizes="(max-width:700px) 96vw, 70vw"
        />
        <span>
          <ZoomIn size={18} /> Look closer
        </span>
      </button>
      <dialog ref={dialog} className="zoom-dialog">
        <div className="zoom-controls">
          <span>{w.title}</span>
          <button
            aria-label="Zoom out"
            onClick={() => setZoom(Math.max(1, zoom - 0.5))}
          >
            <Minus />
          </button>
          <button
            aria-label="Zoom in"
            onClick={() => setZoom(Math.min(3, zoom + 0.5))}
          >
            <Plus />
          </button>
          <button
            aria-label="Close enlarged artwork"
            onClick={() => dialog.current?.close()}
          >
            <X />
          </button>
        </div>
        <div className="zoom-scroll">
          <Image
            unoptimized
            src={w.image}
            alt={w.alt}
            width={w.width}
            height={w.height}
            style={{ width: `${zoom * 85}%`, maxWidth: "none" }}
            sizes="100vw"
          />
        </div>
        <p className="zoom-note">
          Original artwork · Edgar Acosta
        </p>
      </dialog>
    </>
  );
}
