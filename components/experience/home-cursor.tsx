"use client";

import { useEffect, useRef } from "react";

type TrailPoint = { x: number; y: number };

export function HomeCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reducedMotion.matches) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const points: TrailPoint[] = Array.from({ length: 42 }, () => ({ x: -100, y: -100 }));
    let target = { x: -100, y: -100 };
    let visible = false;
    let frame = 0;
    let lastMove = performance.now();

    const resize = () => {
      const ratio = Math.min(devicePixelRatio, 2);
      canvas.width = Math.round(innerWidth * ratio);
      canvas.height = Math.round(innerHeight * ratio);
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const move = (event: PointerEvent) => {
      target = { x: event.clientX, y: event.clientY };
      if (!visible) points.forEach((point) => Object.assign(point, target));
      visible = true;
      lastMove = performance.now();
    };

    const leave = () => {
      visible = false;
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, innerWidth, innerHeight);

      points[0].x += (target.x - points[0].x) * 0.22;
      points[0].y += (target.y - points[0].y) * 0.22;
      for (let index = 1; index < points.length; index += 1) {
        const lead = points[index - 1];
        const point = points[index];
        const ease = Math.max(0.035, 0.1 - index * 0.0015);
        point.x += (lead.x - point.x) * ease;
        point.y += (lead.y - point.y) * ease;
      }

      const idleFade = Math.max(0, 1 - (time - lastMove - 250) / 1400);
      const opacity = visible ? Math.max(0.28, idleFade) : idleFade;
      context.fillStyle = `rgba(255, 255, 255, ${opacity})`;

      points.forEach((point, index) => {
        const previous = points[Math.max(0, index - 1)];
        const next = points[Math.min(points.length - 1, index + 1)];
        const angle = Math.atan2(next.y - previous.y, next.x - previous.x) + Math.PI / 2;
        const samples = index < points.length - 1 ? 3 : 1;
        for (let sample = 0; sample < samples; sample += 1) {
          const amount = sample / samples;
          const progress = (index + amount) / (points.length - 1);
          const x = point.x + (next.x - point.x) * amount;
          const y = point.y + (next.y - point.y) * amount;
          const envelope = Math.sin(progress * Math.PI);
          const halfWidth = Math.max(1, Math.round(envelope * 8));
          const spacing = 6;
          const size = progress < 0.1 ? 3 : 2.5;

          for (let offset = -halfWidth; offset <= halfWidth; offset += 1) {
            if ((index + sample + offset) % 2 && Math.abs(offset) === halfWidth) continue;
            const taper = 1 - Math.abs(offset) / (halfWidth + 1);
            context.globalAlpha = opacity * (0.35 + taper * 0.65) * (1 - progress * 0.72);
            context.fillRect(
              x + Math.cos(angle) * offset * spacing - size / 2,
              y + Math.sin(angle) * offset * spacing - size / 2,
              size,
              size,
            );
          }
        }
      });
      context.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    };

    resize();
    addEventListener("resize", resize);
    addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("resize", resize);
      removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, []);

  return <canvas ref={canvasRef} className="home-cursor" aria-hidden="true" />;
}
