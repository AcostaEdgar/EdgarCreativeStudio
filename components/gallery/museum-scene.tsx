"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Work } from "@/lib/art";

const angleFor = (index: number, count: number) =>
  count < 4
    ? Math.PI + (index - (count - 1) / 2) * 0.6
    : (index / count) * Math.PI * 2;

type Command = {
  type: "overview" | "visit" | "forward" | "back" | "left" | "right";
  index?: number;
};
export function MuseumScene({
  works,
  onOpen,
  initialIndex,
}: {
  works: Work[];
  onOpen: (index: number) => void;
  initialIndex?: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const command = useRef<(c: Command) => void>(() => {});
  const open = useRef(onOpen);
  useEffect(() => {
    open.current = onOpen;
  }, [onOpen]);
  const [status, setStatus] = useState("Preparing your gallery…");
  const [fallback, setFallback] = useState(false);
  const [active, setActive] = useState(0);
  const [overview, setOverview] = useState(true);
  const [paused, setPaused] = useState(false);
  const frozen = useRef(false);
  function send(c: Command) {
    command.current(c);
  }
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let cleanup = () => {};
    async function setup() {
      const T = await import("three");
      if (disposed || !el) return;
      const renderer = new T.WebGLRenderer({
        antialias: true,
        powerPreference: "low-power",
      });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      renderer.outputColorSpace = T.SRGBColorSpace;
      el.appendChild(renderer.domElement);
      const scene = new T.Scene();
      const camera = new T.PerspectiveCamera(55, 1, 0.1, 600);
      // The room grows with the collection so a 40-work show still has breathing room.
      const radius = Math.max(8, works.length * 1.25);
      const materials: import("three").Material[] = [];
      const geometries: import("three").BufferGeometry[] = [];
      const textures: import("three").Texture[] = [];
      const registerMaterial = <M extends import("three").Material>(m: M) => {
        materials.push(m);
        return m;
      };
      const mesh = (
        g: import("three").BufferGeometry,
        m: import("three").Material,
        parent: import("three").Object3D = scene,
      ) => {
        geometries.push(g);
        const o = new T.Mesh(g, m);
        parent.add(o);
        return o;
      };
      const wallMat = registerMaterial(
        new T.MeshStandardMaterial({
          color: 0x292c2a,
          roughness: 0.9,
          side: T.DoubleSide,
        }),
      );
      const floorMat = registerMaterial(
        new T.MeshStandardMaterial({
          color: 0x151a19,
          roughness: 0.38,
          metalness: 0.12,
        }),
      );
      const frameMat = registerMaterial(
        new T.MeshStandardMaterial({
          color: 0x181b19,
          roughness: 0.5,
          metalness: 0.35,
        }),
      );
      const accent = registerMaterial(
        new T.MeshBasicMaterial({ color: 0xe1e5c9 }),
      );
      const wall = mesh(
        new T.CylinderGeometry(
          radius + 0.25,
          radius + 0.25,
          7,
          Math.max(96, works.length * 2),
          1,
          true,
        ),
        wallMat,
      );
      wall.position.y = 3.5;
      const floor = mesh(new T.CircleGeometry(radius + 1, 128), floorMat);
      floor.rotation.x = -Math.PI / 2;
      const hem = new T.HemisphereLight(0xe7ede9, 0x38362b, 2.2);
      scene.add(hem);
      const key = new T.DirectionalLight(0xfff3d6, 2);
      key.position.set(2, 10, 2);
      scene.add(key);
      for (const y of [0.08, 6.5]) {
        const ring = mesh(
          new T.TorusGeometry(radius - 0.08, 0.025, 6, 160),
          accent,
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.y = y;
      }
      // Soft light is painted onto the room, never over the artwork texture.
      const glowCanvas = document.createElement("canvas");
      glowCanvas.width = glowCanvas.height = 128;
      const ctx = glowCanvas.getContext("2d")!;
      const glow = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      glow.addColorStop(0, "rgba(255,248,215,.75)");
      glow.addColorStop(0.45, "rgba(255,248,215,.22)");
      glow.addColorStop(1, "rgba(255,248,215,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 128, 128);
      const glowTexture = new T.CanvasTexture(glowCanvas);
      textures.push(glowTexture);
      const glowMat = registerMaterial(
        new T.MeshBasicMaterial({
          map: glowTexture,
          transparent: true,
          depthWrite: false,
          side: T.DoubleSide,
          opacity: 0.55,
        }),
      );
      const beamMat = registerMaterial(
        new T.MeshBasicMaterial({
          color: 0xeaf3d7,
          transparent: true,
          opacity: 0.085,
          depthWrite: false,
          side: T.DoubleSide,
        }),
      );
      const beam = new T.Group();
      scene.add(beam);
      for (let i = 0; i < 5; i++) {
        const pillar = mesh(
          new T.CylinderGeometry(
            0.14 + i * 0.14,
            0.14 + i * 0.14,
            8,
            40,
            1,
            true,
          ),
          beamMat,
          beam,
        );
        pillar.position.y = 4;
      }
      const core = mesh(
        new T.CylinderGeometry(0.045, 0.045, 8, 20),
        accent,
        beam,
      );
      core.position.y = 4;
      const pool = mesh(new T.PlaneGeometry(7, 7), glowMat);
      pool.rotation.x = -Math.PI / 2;
      pool.position.y = 0.02;
      const plinth = mesh(
        new T.CylinderGeometry(0.85, 1.05, 0.12, 64),
        frameMat,
      );
      plinth.position.y = 0.06;
      const points = new T.BufferGeometry();
      geometries.push(points);
      const coords = new Float32Array(180 * 3);
      for (let i = 0; i < 180; i++) {
        const a = i * 2.399;
        const r = 1.1 + ((i % 19) / 19) * 1.7;
        coords[i * 3] = Math.cos(a) * r;
        coords[i * 3 + 1] = ((i % 43) / 43) * 7;
        coords[i * 3 + 2] = Math.sin(a) * r;
      }
      points.setAttribute("position", new T.BufferAttribute(coords, 3));
      const dust = new T.Points(
        points,
        registerMaterial(
          new T.PointsMaterial({
            color: 0xe9e7c8,
            size: 0.025,
            transparent: true,
            opacity: 0.55,
          }),
        ),
      );
      scene.add(dust);
      const targets: import("three").Mesh[] = [];
      let loaded = 0,
        failed = 0;
      const loader = new T.TextureLoader();
      const pending: Array<() => Promise<void>> = [];
      works.forEach((work, i) => {
        const a = angleFor(i, works.length);
        const group = new T.Group();
        group.position.set(Math.sin(a) * radius, 2.7, Math.cos(a) * radius);
        group.rotation.y = a + Math.PI;
        scene.add(group);
        const spot = new T.SpotLight(0xfff0cf, 8, 8, Math.PI / 7, 0.72, 1.3);
        spot.position.set(0, 2.25, 1.45);
        spot.target.position.set(0, 0, 0);
        group.add(spot, spot.target);
        const hasDimensions = Number(work.physicalWidth)>0 && Number(work.physicalHeight)>0;
        const unitInCm = work.unit === "in" ? 2.54 : work.unit === "mm" ? 0.1 : 1;
        const physicalWidth = hasDimensions ? work.physicalWidth! * unitInCm : work.width;
        const physicalHeight = hasDimensions ? work.physicalHeight! * unitInCm : work.height;
        const ratio = physicalWidth / physicalHeight;
        const h = hasDimensions ? Math.max(0.15, Math.min(3.8, physicalHeight * 0.025)) : Math.min(2.8, 2.5 / ratio),
          w = h * ratio;
        const surround = mesh(
          new T.BoxGeometry(w + 0.16, h + 0.16, 0.11),
          frameMat,
          group,
        );
        surround.position.z = 0.04;
        const light = mesh(new T.PlaneGeometry(4.3, 5.8), glowMat, group);
        light.position.z = -0.05;
        const bar = mesh(new T.BoxGeometry(0.65, 0.025, 0.1), accent, group);
        bar.position.set(0, 2.1, 0.08);
        const mat = registerMaterial(
          new T.MeshBasicMaterial({ color: 0x858981, side: T.DoubleSide }),
        );
        const painting = mesh(new T.PlaneGeometry(w, h), mat, group);
        painting.position.z = 0.103;
        painting.userData.index = i;
        targets.push(painting);
        pending.push(async () => {
          try {
            const tex: import("three").Texture = await loader.loadAsync(
              work.image,
            );
            if (disposed) {
              tex.dispose();
              return;
            }
            const image = tex.image as HTMLImageElement;
            const scale = Math.min(
              1,
              768 / Math.max(image.width, image.height),
            );
            if (scale < 1) {
              const canvas = document.createElement("canvas");
              canvas.width = Math.round(image.width * scale);
              canvas.height = Math.round(image.height * scale);
              canvas
                .getContext("2d")!
                .drawImage(image, 0, 0, canvas.width, canvas.height);
              tex.source = new T.TextureSource(canvas);
              tex.needsUpdate = true;
            }
            tex.colorSpace = T.SRGBColorSpace;
            tex.anisotropy = Math.min(
              4,
              renderer.capabilities.getMaxAnisotropy(),
            );
            textures.push(tex);
            mat.map = tex;
            mat.color.set(0xffffff);
            mat.needsUpdate = true;
          } catch {
            failed++;
            if (!disposed) setFallback(true);
          }
          loaded++;
          if (!disposed)
            setStatus(
              loaded === works.length
                ? failed
                  ? `${failed} image(s) unavailable in 3D. Use Index to view or retry.`
                  : ""
                : `Hanging works ${loaded} / ${works.length}`,
            );
        });
      });
      // Limit simultaneous decode / upload work for larger portfolios.
      void Promise.all(
        Array.from({ length: Math.min(3, pending.length) }, async () => {
          while (pending.length && !disposed) await pending.shift()!();
        }),
      );
      let lightMode = false;
      const theme = () => {
        lightMode = document.documentElement.dataset.theme === "light";
        scene.background = new T.Color(lightMode ? 0xd9d8ce : 0x101615);
        wallMat.color.set(lightMode ? 0xd8d6cb : 0x292c2a);
        floorMat.color.set(lightMode ? 0xb6b8b0 : 0x151a19);
        hem.intensity = lightMode ? 2.7 : 1.5;
        glowMat.opacity = lightMode ? 0.65 : 0.4;
      };
      theme();
      const mutation = new MutationObserver(theme);
      mutation.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
      const reduced = matchMedia("(prefers-reduced-motion: reduce)");
      const targetPos = new T.Vector3(0, radius * 1.35 + 4, radius * 1.2);
      const targetLook = new T.Vector3(0, 1.7, 0);
      const looking = targetLook.clone();
      camera.position.copy(targetPos);
      let isOverview = true,
        yaw = 0,
        pitch = 0,
        tour = 0,
        visible = true,
        frame = 0,
        last = 0;
      const keys = new Set<string>();
      const visit = (i: number) => {
        tour = (i + works.length) % works.length;
        const a = angleFor(tour, works.length);
        const distance = camera.aspect < 0.8 ? 6.8 : 5.7;
        targetPos.set(
          Math.sin(a) * (radius - distance),
          2.7,
          Math.cos(a) * (radius - distance),
        );
        yaw = a;
        pitch = -0.07;
        targetLook.set(Math.sin(a) * radius, 2.3, Math.cos(a) * radius);
        isOverview = false;
        setOverview(false);
        setActive(tour);
      };
      const aim = () =>
        targetLook
          .copy(targetPos)
          .add(
            new T.Vector3(
              Math.sin(yaw) * Math.cos(pitch),
              Math.sin(pitch),
              Math.cos(yaw) * Math.cos(pitch),
            ).multiplyScalar(5),
          );
      const move = (forward: number, side = 0) => {
        if (isOverview) visit(tour);
        targetPos.x += Math.sin(yaw) * forward + Math.cos(yaw) * side;
        targetPos.z += Math.cos(yaw) * forward - Math.sin(yaw) * side;
        const length = Math.hypot(targetPos.x, targetPos.z);
        if (length > radius - 0.8) {
          targetPos.x *= (radius - 0.8) / length;
          targetPos.z *= (radius - 0.8) / length;
        }
        aim();
      };
      command.current = (c) => {
        if (c.type === "visit") visit(c.index || 0);
        else if (c.type === "overview") {
          isOverview = true;
          setOverview(true);
          targetPos.set(
            0,
            radius * (camera.aspect < 0.8 ? 2.1 : 1.35) + 4,
            radius * 1.2,
          );
          targetLook.set(0, 1.7, 0);
        } else if (c.type === "forward") move(1.3);
        else if (c.type === "back") move(-1.3);
        else {
          if (isOverview) visit(tour);
          yaw += c.type === "left" ? 0.28 : -0.28;
          aim();
        }
      };
      let down: { x: number; y: number; dragged: boolean } | null = null;
      const pointerDown = (e: PointerEvent) => {
        if (e.button !== 0) return;
        el.focus({ preventScroll: true });
        down = { x: e.clientX, y: e.clientY, dragged: false };
        el.setPointerCapture(e.pointerId);
      };
      const pointerMove = (e: PointerEvent) => {
        if (!down) return;
        const dx = e.clientX - down.x,
          dy = e.clientY - down.y;
        if (Math.abs(dx) + Math.abs(dy) > 3) down.dragged = true;
        if (isOverview) {
          const a = Math.atan2(targetPos.x, targetPos.z) - dx * 0.005;
          const r = Math.hypot(targetPos.x, targetPos.z);
          targetPos.x = Math.sin(a) * r;
          targetPos.z = Math.cos(a) * r;
        } else {
          yaw -= dx * 0.004;
          pitch = Math.max(-0.8, Math.min(0.8, pitch + dy * 0.003));
          aim();
        }
        down.x = e.clientX;
        down.y = e.clientY;
      };
      const ray = new T.Raycaster();
      const pointerUp = (e: PointerEvent) => {
        if (down && !down.dragged) {
          const r = el.getBoundingClientRect();
          ray.setFromCamera(
            new T.Vector2(
              ((e.clientX - r.left) / r.width) * 2 - 1,
              (-(e.clientY - r.top) / r.height) * 2 + 1,
            ),
            camera,
          );
          const hit = ray.intersectObjects(targets)[0];
          if (hit) {
            const i = hit.object.userData.index as number;
            setActive(i);
            open.current(i);
          }
        }
        down = null;
      };
      const cancel = () => {
        down = null;
        keys.clear();
      };
      const keyDown = (e: KeyboardEvent) => {
        if (
          [
            "w",
            "a",
            "s",
            "d",
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            "Home",
            "Enter",
          ].includes(e.key)
        ) {
          e.preventDefault();
          keys.add(e.key);
          if (e.key === "Home") command.current({ type: "overview" });
          if (e.key === "Enter") open.current(tour);
        }
      };
      const keyUp = (e: KeyboardEvent) => {
        keys.delete(e.key);
      };
      const wheel = (e: WheelEvent) => {
        if (document.activeElement !== el) return;
        e.preventDefault();
        move(-Math.sign(e.deltaY) * 0.65);
      };
      el.addEventListener("pointerdown", pointerDown);
      el.addEventListener("pointermove", pointerMove);
      el.addEventListener("pointerup", pointerUp);
      el.addEventListener("pointercancel", cancel);
      el.addEventListener("blur", cancel);
      el.addEventListener("keydown", keyDown);
      el.addEventListener("keyup", keyUp);
      el.addEventListener("wheel", wheel, { passive: false });
      const resize = () => {
        const r = el.getBoundingClientRect();
        renderer.setSize(r.width, r.height);
        camera.aspect = r.width / Math.max(1, r.height);
        camera.updateProjectionMatrix();
        if (isOverview) command.current({ type: "overview" });
      };
      const observer = new ResizeObserver(resize);
      observer.observe(el);
      resize();
      const intersection = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) keys.clear();
      });
      intersection.observe(el);
      const draw = (time: number) => {
        frame = requestAnimationFrame(draw);
        if (!visible || document.hidden || time - last < 25) return;
        const dt = Math.min(0.05, (time - last) / 1000);
        last = time;
        if (keys.has("w") || keys.has("ArrowUp")) move(dt * 3);
        if (keys.has("s") || keys.has("ArrowDown")) move(-dt * 3);
        if (keys.has("a")) move(0, dt * 3);
        if (keys.has("d")) move(0, -dt * 3);
        if (keys.has("ArrowLeft") || keys.has("ArrowRight")) {
          if (isOverview) visit(tour);
          yaw += (keys.has("ArrowLeft") ? 1 : -1) * dt;
          aim();
        }
        const ease = reduced.matches ? 1 : 1 - Math.exp(-dt * 7);
        camera.position.lerp(targetPos, ease);
        looking.lerp(targetLook, ease);
        camera.lookAt(looking);
        if (!frozen.current && !reduced.matches) dust.rotation.y += dt * 0.025;
        renderer.render(scene, camera);
      };
      draw(0);
      if (initialIndex !== undefined && works[initialIndex]) {
        command.current({ type: "visit", index: initialIndex });
      }
      cleanup = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        intersection.disconnect();
        mutation.disconnect();
        el.removeEventListener("pointerdown", pointerDown);
        el.removeEventListener("pointermove", pointerMove);
        el.removeEventListener("pointerup", pointerUp);
        el.removeEventListener("pointercancel", cancel);
        el.removeEventListener("blur", cancel);
        el.removeEventListener("keydown", keyDown);
        el.removeEventListener("keyup", keyUp);
        el.removeEventListener("wheel", wheel);
        materials.forEach((m) => m.dispose());
        geometries.forEach((g) => g.dispose());
        textures.forEach((t) => t.dispose());
        renderer.dispose();
        renderer.domElement.remove();
        command.current = () => {};
      };
    }
    setup().catch(() => {
      if (!disposed)
        setStatus(
          "3D is unavailable on this device. Use Index to explore every work.",
        );
      cleanup();
    });
    return () => {
      disposed = true;
      cleanup();
    };
  }, [works, initialIndex]);
  return (
    <div
      className={`museum-installation ${fallback ? "has-image-fallback" : ""}`}
    >
      <div
        ref={host}
        className="museum-canvas"
        tabIndex={0}
        role="region"
        aria-label="Interactive 3D museum. Drag to look. W A S D or arrows to move. Home for overview. Enter to open the selected work."
      />
      {fallback && (
        <div
          className="museum-image-fallback"
          aria-label="Artwork image fallback"
        >
          {works.map((work) => (
            <Image
              key={work.id}
              src={work.image}
              alt={work.alt}
              width={work.width}
              height={work.height}
              unoptimized
            />
          ))}
        </div>
      )}
      <div className="museum-identity">
        <span className="eyebrow">THE INNER WORLD</span>
        <p>{overview ? "A collection in orbit." : works[active]?.title}</p>
        <span>{String(works.length).padStart(2, "0")} works / one space</span>
      </div>
      <div className="museum-compass" aria-label="Collection map">
        {works.map((w, i) => {
          const a = angleFor(i, works.length);
          return (
            <button
              key={w.id}
              aria-label={`Walk to ${w.title}`}
              title={w.title}
              style={{
                left: `${(50 + Math.sin(a) * 39).toFixed(3)}%`,
                top: `${(50 - Math.cos(a) * 39).toFixed(3)}%`,
              }}
              onClick={() => send({ type: "visit", index: i })}
              className={i === active && !overview ? "is-active" : ""}
            />
          );
        })}
        <span>E↗</span>
      </div>
      {status && (
        <p className="museum-status" role="status">
          {status}
        </p>
      )}
      <div className="museum-navigation">
        <div className="museum-work-stepper">
          <button aria-label="Visit previous artwork" onClick={()=>send({type:"visit",index:(active-1+works.length)%works.length})}>←</button>
          <button aria-label="Visit next artwork" onClick={()=>send({type:"visit",index:(active+1)%works.length})}>→</button>
        </div>
        <button
          onClick={() =>
            send({ type: overview ? "visit" : "overview", index: active })
          }
        >
          {overview ? "Enter the gallery ↗" : "View entire space ⊙"}
        </button>
        <label className="museum-select">
          Visit a work
          <select
            aria-label="Visit a work"
            value={active}
            onChange={(e) =>
              send({ type: "visit", index: Number(e.target.value) })
            }
          >
            {works.map((w, i) => (
              <option key={w.id} value={i}>
                {String(i + 1).padStart(2, "0")} / {w.title}
              </option>
            ))}
          </select>
        </label>
        <button onClick={() => open.current(active)}>View work ↗</button>
      </div>
      <div className="museum-foot">
        <span>DRAG TO LOOK · ARROWS / WASD TO WANDER</span>
        <div className="museum-step">
          <button aria-label="Turn left" onClick={() => send({ type: "left" })}>
            ↶
          </button>
          <button
            aria-label="Move forward"
            onClick={() => send({ type: "forward" })}
          >
            ↑
          </button>
          <button
            aria-label="Move backward"
            onClick={() => send({ type: "back" })}
          >
            ↓
          </button>
          <button
            aria-label="Turn right"
            onClick={() => send({ type: "right" })}
          >
            ↷
          </button>
        </div>
        <button
          aria-pressed={paused}
          onClick={() => {
            frozen.current = !paused;
            setPaused(!paused);
          }}
        >
          {paused ? "Resume atmosphere" : "Pause atmosphere"}
        </button>
      </div>
    </div>
  );
}
