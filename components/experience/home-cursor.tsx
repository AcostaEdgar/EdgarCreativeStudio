"use client";

import { useEffect, useRef } from "react";

type TrailPoint = { x: number; y: number };

export function HomeCursor({ paused = false }: { paused?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reducedMotion.matches) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const points: (TrailPoint & { time: number })[] = [];
    let frame = 0;
    let previous: (TrailPoint & { time: number }) | null = null;
    const lifetime = 180;
    const maxLength = 105;

    const resize = () => {
      const ratio = Math.min(devicePixelRatio, 1.5);
      canvas.width = Math.round(innerWidth * ratio);
      canvas.height = Math.round(innerHeight * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const leave = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      points.length = 0;
      previous = null;
      context.clearRect(0, 0, innerWidth, innerHeight);
    };
    const draw = (time: number) => {
      frame = 0;
      context.clearRect(0, 0, innerWidth, innerHeight);
      while (points.length && time - points[0].time >= lifetime) points.shift();
      if (!points.length) return;
      const left = Math.floor((Math.min(...points.map(p => p.x)) - 20) / 6) * 6;
      const top = Math.floor((Math.min(...points.map(p => p.y)) - 20) / 6) * 6;
      const right = Math.max(...points.map(p => p.x)) + 20;
      const bottom = Math.max(...points.map(p => p.y)) + 20;
      context.fillStyle = "#fff";
      // A single dot per cell keeps the halftone crisp, even around corners.
      for (let y = top; y <= bottom; y += 6) {
        for (let x = left; x <= right; x += 6) {
          let strength = 0;
          for (const point of points) {
            const life = Math.max(0, 1 - (time - point.time) / lifetime);
            const radius = 5 + 14 * Math.sin(life * Math.PI * 0.8);
            strength = Math.max(strength, (1 - Math.hypot(x - point.x, y - point.y) / radius) * life);
          }
          if (strength <= 0.08) continue;
          const size = 1 + Math.min(1, strength * 2) * 0.9;
          context.globalAlpha = Math.min(0.8, strength * 1.3);
          context.fillRect(x - size / 2, y - size / 2, size, size);
        }
      }
      context.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    };
    const move = (event: PointerEvent) => {
      if (!finePointer.matches || reducedMotion.matches || paused || event.pointerType === "touch") return;
      if (event.target instanceof Element && event.target.closest("dialog, input, textarea, select")) {
        leave();
        return;
      }
      const current = { x: event.clientX, y: event.clientY, time: performance.now() };
      if (previous && current.time - previous.time < lifetime) {
        const distance = Math.hypot(current.x - previous.x, current.y - previous.y);
        const length = Math.min(distance, maxLength);
        const steps = Math.ceil(length / 6);
        for (let i = steps; i >= 0; i--) {
          const t = steps ? i / steps * length / Math.max(1, distance) : 0;
          points.push({ x: current.x + (previous.x - current.x) * t,
            y: current.y + (previous.y - current.y) * t,
            time: current.time - (current.time - previous.time) * t });
        }
      }
      previous = current;
      while (points.length && (points.length > 32 || current.time - points[0].time >= lifetime || Math.hypot(points[0].x - current.x, points[0].y - current.y) > maxLength)) points.shift();
      if (!frame && points.length) frame = requestAnimationFrame(draw);
    };

    resize();
    addEventListener("resize", resize);
    addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    addEventListener("blur", leave);
    reducedMotion.addEventListener("change", leave);
    finePointer.addEventListener("change", leave);
    document.addEventListener("visibilitychange", leave);

    return () => {
      leave();
      removeEventListener("blur", leave);
      reducedMotion.removeEventListener("change", leave);
      finePointer.removeEventListener("change", leave);
      document.removeEventListener("visibilitychange", leave);
      removeEventListener("resize", resize);
      removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, [paused]);

  return <canvas ref={canvasRef} className="home-cursor" aria-hidden="true" />;
}
