"use client";

import { useEffect, useRef, useState } from "react";

/** A brief arrival, bounded so a slow image never blocks entry. */
export function StudioOpening({ ready }: { ready: boolean }) {
  const [visible, setVisible] = useState(true);
  const readyRef = useRef(ready);
  const started = useRef(0);
  useEffect(() => {
    readyRef.current = ready;
  }, [ready]);
  useEffect(() => {
    started.current = performance.now();
    const minimum = matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : 800;
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - started.current;
      if ((readyRef.current && elapsed >= minimum) || elapsed >= 2200) {
        setVisible(false);
        clearInterval(timer);
      }
    }, 80);
    return () => clearInterval(timer);
  }, []);
  return (
    <div
      className={`studio-opening ${visible ? "" : "is-entered"}`}
      aria-hidden={!visible}
    >
      <span className="opening-label">
        EDGAR ACOSTA / INDEPENDENT CREATIVE STUDIO
      </span>
      <div className="opening-mark" aria-label="Edgar Studio">
        edgar<span>studio</span>
        <i>.</i>
      </div>
      <div className="opening-base">
        <span>GO IN ALL THE WAY.</span>
        <button tabIndex={visible ? 0 : -1} onClick={() => setVisible(false)}>
          Enter studio ↗
        </button>
      </div>
      <span className="opening-line" aria-hidden="true" />
    </div>
  );
}
