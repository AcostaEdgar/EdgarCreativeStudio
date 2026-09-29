"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { Media } from "@/lib/studio-state";

/** The original perspective-card entrance, using Edgar's portfolio. */
export function WorldScene({
  hero,
  paused,
  active = 1,
  onReady,
}: {
  hero: Media[];
  paused: boolean;
  active?: number;
  onReady?: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const readyRef = useRef(onReady);
  useEffect(() => {
    readyRef.current = onReady;
  }, [onReady]);
  const pauseRef = useRef(paused);
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);
  useEffect(() => {
    pauseRef.current = paused;
  }, [paused]);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false;
    let cleanup = () => {};
    async function setup() {
      if (!hero.length || hero.some((item) => item.kind === "video")) {
        element!.dataset.state = "fallback";
        readyRef.current?.();
        return;
      }
      const THREE = await import("three");
      if (disposed || !element) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: "low-power",
        });
      } catch {
        element.dataset.state = "fallback";
        readyRef.current?.();
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0x000000, 0);
      element.appendChild(renderer.domElement);
      cleanup = () => {
        renderer.dispose();
        renderer.domElement.remove();
      };
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
      camera.position.set(0, 0, 11);
      const loader = new THREE.TextureLoader();
      const paths = hero;
      const textures = await Promise.all(
        paths.map((p) =>
          loader.loadAsync(
            `/_next/image?url=${encodeURIComponent(p.url)}&w=1080&q=80`,
          ),
        ),
      );
      if (disposed) {
        textures.forEach((t) => t.dispose());
        renderer.dispose();
        renderer.domElement.remove();
        return;
      }
      textures.forEach((t, i) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        // Keep the original portrait-card silhouettes without stretching photos.
        const aspect = paths[i].width / paths[i].height;
        if (aspect > 0.75) {
          t.repeat.x = 0.75 / aspect;
          t.offset.x = (1 - t.repeat.x) / 2;
        } else {
          t.repeat.y = aspect / 0.75;
          t.offset.y = (1 - t.repeat.y) / 2;
        }
      });
      const cards = textures.map((texture) => {
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(3.24, 4.32),
          material,
        );
        scene.add(mesh);
        return mesh;
      });
      let targetX = 0,
        targetY = 0,
        visible = true,
        frame = 0,
        last = 0,
        progress = 0,
        dragging = false,
        previousX = 0,
        drag = 0;
      let displayed = -1,
        fade = 1;
      const reduced = matchMedia("(prefers-reduced-motion: reduce)");
      let width = 1,
        height = 1;
      const render = (time: number) => {
        const dt = Math.min(0.05, Math.max(0.001, (time - last) / 1000));
        const narrow = window.innerWidth < 700;
        const motion = !reduced.matches && !pauseRef.current;
        if (displayed !== activeRef.current) {
          fade = motion ? Math.max(0, fade - dt * 7) : 0;
          if (fade === 0) {
            displayed = activeRef.current;
            const indices = [
              (displayed + 3) % textures.length,
              displayed % textures.length,
              (displayed + 1) % textures.length,
              (displayed + 2) % textures.length,
            ];
            cards.forEach((card, i) => {
              card.material.map = textures[indices[i]];
            });
          }
        } else fade = motion ? Math.min(1, fade + dt * 7) : 1;
        cards.forEach((card) => {
          card.material.transparent = fade < 1;
          card.material.opacity = fade;
        });
        const section = element.closest<HTMLElement>(".experience-scroll");
        const rect = section?.getBoundingClientRect();
        const target =
          !reduced.matches && !pauseRef.current && rect && section
            ? Math.max(
                0,
                Math.min(
                  1,
                  -rect.top / Math.max(1, section.offsetHeight - innerHeight),
                ),
              )
            : 0;
        progress += (target - progress) * (1 - Math.exp(-dt * 12));
        const spread = narrow ? 2.25 : 3.8;
        const bases =
          cards.length === 1
            ? [[0, 0.25, 1]]
            : [
                [-spread, 0.12, -1.2],
                [0, 0.25, 1],
                [spread, -0.15, -0.4],
                [spread * 1.9, 0.4, -2.4],
              ];
        cards.forEach((card, i) => {
          const [x, y, z] = bases[i];
          card.position.set(
            x * (1 + progress * 1.4),
            y + (motion ? Math.sin(time * 0.0003 + i) * 0.07 : 0),
            z,
          );
          card.rotation.y =
            (i === 1 ? -0.04 : i < 1 ? 0.28 : -0.3) * (1 - progress);
          card.rotation.z =
            (i === 1 ? 0.035 : i < 1 ? -0.045 : 0.055) * (1 - progress);
        });
        camera.position.x +=
          ((motion ? targetX * 0.32 : 0) + drag - camera.position.x) *
          (1 - Math.exp(-dt * 9));
        camera.position.y +=
          ((motion ? -targetY * 0.18 : 0) - camera.position.y) *
          (1 - Math.exp(-dt * 9));
        camera.position.z =
          (narrow ? 11.6 : 10.7) - progress * (narrow ? 3.2 : 7.35);
        camera.lookAt(0, 0.15, 0);
        renderer.render(scene, camera);
      };
      const resize = () => {
        const b = element.getBoundingClientRect();
        width = b.width;
        height = b.height;
        if (!width || !height) return;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        render(0);
      };
      const ro = new ResizeObserver(resize);
      ro.observe(element);
      const observer = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
        },
        { rootMargin: "100px" },
      );
      observer.observe(element);
      const move = (e: PointerEvent) => {
        if (reduced.matches || pauseRef.current) return;
        const b = element.getBoundingClientRect();
        targetX = (e.clientX - b.left) / b.width - 0.5;
        targetY = (e.clientY - b.top) / b.height - 0.5;
        if (dragging)
          drag = Math.max(
            -1.5,
            Math.min(1.5, drag - (e.clientX - previousX) * 0.005),
          );
        previousX = e.clientX;
      };
      const down = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        dragging = true;
        previousX = e.clientX;
        element.setPointerCapture(e.pointerId);
      };
      const up = () => {
        dragging = false;
      };
      const key = (e: KeyboardEvent) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          drag = Math.max(
            -1.5,
            Math.min(1.5, drag + (e.key === "ArrowLeft" ? -0.3 : 0.3)),
          );
          render(0);
        }
      };
      const loss = (e: Event) => {
        e.preventDefault();
        element.dataset.state = "fallback";
      };
      element.addEventListener("pointermove", move);
      element.addEventListener("pointerdown", down);
      element.addEventListener("pointerup", up);
      element.addEventListener("pointercancel", up);
      element.addEventListener("keydown", key);
      renderer.domElement.addEventListener("webglcontextlost", loss);
      const animate = (time: number) => {
        frame = requestAnimationFrame(animate);
        if (!visible || document.hidden) {
          last = time;
          return;
        }
        if (
          (reduced.matches || pauseRef.current) &&
          displayed === activeRef.current &&
          fade === 1 &&
          time - last < 150
        )
          return;
        render(time);
        last = time;
      };
      resize();
      element.dataset.state = "ready";
      readyRef.current?.();
      frame = requestAnimationFrame(animate);
      cleanup = () => {
        cancelAnimationFrame(frame);
        ro.disconnect();
        observer.disconnect();
        element.removeEventListener("pointermove", move);
        element.removeEventListener("pointerdown", down);
        element.removeEventListener("pointerup", up);
        element.removeEventListener("pointercancel", up);
        element.removeEventListener("keydown", key);
        renderer.domElement.removeEventListener("webglcontextlost", loss);
        cards.forEach((c) => {
          c.geometry.dispose();
          c.material.dispose();
        });
        textures.forEach((t) => t.dispose());
        renderer.dispose();
        renderer.domElement.remove();
      };
    }
    setup().catch(() => {
      if (element) element.dataset.state = "fallback";
      readyRef.current?.();
    });
    return () => {
      disposed = true;
      cleanup();
    };
  }, [hero]);
  return (
    <div
      ref={host}
      className="world-scene"
      role="img"
      aria-label="Works by Edgar Acosta floating in space. Drag or use arrow keys to change perspective."
      tabIndex={0}
      data-state="loading"
    >
      <div className="scene-fallback" aria-hidden="true">
        {hero.length > 0 &&
          [
            ...new Set([
              (active + hero.length - 1) % hero.length,
              active % hero.length,
              (active + 1) % hero.length,
            ]),
          ]
            .filter((index) => hero[index]?.kind === "image")
            .map((index) => (
              <Image
                key={index}
                src={hero[index].url}
                alt=""
                width={hero[index].width}
                height={hero[index].height}
                quality={80}
                sizes="(max-width:700px) 60vw, 35vw"
                onLoad={() => readyRef.current?.()}
                loading={index === active ? "eager" : "lazy"}
                fetchPriority={index === active ? "high" : "auto"}
              />
            ))}
      </div>
    </div>
  );
}
