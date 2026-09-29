"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDown, Pause, Play } from "lucide-react";
import { Navigation } from "../navigation";
import { Footer } from "../footer";
import { WorldScene } from "./world-scene";
import { StudioOpening } from "./studio-opening";
import { HomeCursor } from "./home-cursor";
import { PortfolioTiles } from "../portfolio-tiles";
import { brand } from "@/lib/brand";
import type { HomeMedia, Work } from "@/lib/studio-state";
import "./experience.css";
import "./art-direction.css";

export function HomeExperience({
  slots,
  works,
}: {
  slots: HomeMedia;
  works: Work[];
}) {
  const [paused, setPaused] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [active, setActive] = useState(slots.hero.length > 1 ? 1 : 0);
  const scroll = useRef<HTMLElement>(null),
    video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = scroll.current;
    if (!el) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const p =
        reduced.matches || paused
          ? 0
          : Math.max(
              0,
              Math.min(
                1,
                -rect.top / Math.max(1, el.offsetHeight - innerHeight),
              ),
            );
      el.style.setProperty("--travel", String(p));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    reduced.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      reduced.removeEventListener("change", schedule);
    };
  }, [paused]);
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    let visible = false;
    const update = () => {
      if (
        paused ||
        reduced.matches ||
        connection?.saveData ||
        !visible ||
        document.hidden
      )
        el.pause();
      else el.play().catch(() => {});
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        update();
      },
      { threshold: 0.05 },
    );
    observer.observe(el);
    reduced.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      observer.disconnect();
      reduced.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
      el.pause();
    };
  }, [paused]);
  const control = (
    <button
      className="motion-control"
      aria-pressed={paused}
      onClick={() => setPaused(!paused)}
    >
      {paused ? <Play size={13} /> : <Pause size={13} />}{" "}
      {paused ? "RESUME MOTION" : "PAUSE MOTION"}
    </button>
  );
  return (
    <div
      className={`experience studio-edition ${paused ? "motion-paused" : ""}`}
    >
      <StudioOpening ready={sceneReady} />
      <HomeCursor paused={paused} />
      <main id="main">
        <section
          ref={scroll}
          className="experience-scroll"
          aria-label="The entrance"
        >
          <div className="experience-stage">
            <Navigation home />
            <div className="stage-grid" />
            <div className="stage-topline">
              <span>
                <i /> ART. INSTINCT. INTENTION.
              </span>
              <span>INDEPENDENT IN SPIRIT. EXACTING IN EXECUTION.</span>
            </div>
            <div className="portal-scene">
              <WorldScene
                hero={slots.hero}
                paused={paused}
                active={active}
                onReady={() => setSceneReady(true)}
              />
            </div>
            <div className="experience-title">
              <h1>
                GO IN
                <br />
                ALL THE
                <br />
                <span>WAY.</span>
              </h1>
            </div>
            <div className="experience-side">
              <p className="hero-vow">Or not at all.</p>
              <p className="hero-intro">
                Art, strategy, and digital experiences.
                <br />
                By Edgar Acosta.
              </p>
              <div className="hero-actions">
                <Link className="studio-button" href="/gallery">
                  Enter the showroom <ArrowUpRight size={18} />
                </Link>
                <Link className="studio-text-link" href="/start">
                  Start a project <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>
            <div className="scene-caption">
              <span>THE ENTRANCE /</span>
              <div className="scene-selectors">
                {slots.hero.map((item, i) => (
                  <button
                    key={item.id}
                    aria-label={`Show entrance image ${i + 1}`}
                    aria-pressed={active === i}
                    onClick={() => setActive(i)}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>
            <div className="portal-end">
              <p>A point of view. A world of possibility.</p>
              <span className="eyebrow">ART INTO EXPERIENCE</span>
            </div>
            <div className="experience-bottom">
              <a href="#motion" className="scroll-cue">
                <span className="scroll-symbol">
                  <ArrowDown size={16} />
                </span>
                <span>SCROLL TO EXPLORE</span>
              </a>
              {control}
              <span className="experience-index">01 / THE ENTRANCE</span>
            </div>
          </div>
        </section>
        <section
          id="motion"
          className="motion-interlude"
          aria-label="Motion study"
        >
          <video
            ref={video}
            muted
            loop
            playsInline
            preload="none"
            poster="/motion/ink-poster.jpg"
            aria-label="Flowing colored ink motion study"
          >
            <source
              src={slots.feature_video?.url || "/motion/ink-flow.mp4"}
              type="video/mp4"
            />
          </video>
          <div className="interlude-shade" />
          <p className="eyebrow">02 / A DIFFERENT PERSPECTIVE</p>
          <div className="interlude-control">{control}</div>
          <h2>
            MAKE
            <br />
            SOMEONE
            <br />
            <span>FEEL IT.</span>
          </h2>
          <div className="interlude-bottom">
            <p>
              Before it becomes a strategy,
              <br />
              it has to become a feeling.
            </p>
            {!slots.feature_video && (
              <a
                className="motion-credit"
                href="https://mixkit.co/free-stock-video/vibrant-colored-inks-interacting-with-a-black-liquid-creating-flowing-99927/"
                target="_blank"
                rel="noreferrer"
              >
                MOTION FOOTAGE / MIXKIT ↗
              </a>
            )}
            <a href="#work" aria-label="Explore selected work">
              <ArrowDown />
            </a>
          </div>
        </section>
        <section id="work">
          <PortfolioTiles works={works} />
        </section>
        <section className="studio-practice">
          <div className="studio-practice-intro">
            <p className="eyebrow">04 / THE PRACTICE</p>
            <h2>
              Clear thinking.
              <br />
              <em>Distinct feeling.</em>
            </h2>
            <p>
              I work where artistic instinct meets commercial intent. From the
              first question to the final detail: a clear idea, expressed with
              conviction.
            </p>
          </div>
          <div className="studio-practice-grid">
            <article>
              <span>01</span>
              <h3>Position</h3>
              <p>
                Find what makes you worth paying attention to. Brand strategy,
                positioning, and creative consultation.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>Express</h3>
              <p>
                Give the idea a voice and a visual language. Copywriting, art
                direction, design, and campaigns.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>Build</h3>
              <p>
                Make the idea an experience people can step into. Websites,
                digital design, and immersive environments.
              </p>
            </article>
          </div>
          <div className="studio-process">
            <span>FIND THE TENSION</span>
            <span>SHAPE THE STORY</span>
            <span>BUILD THE WORLD</span>
            <span>MAKE IT MOVE</span>
          </div>
        </section>
        <section className="gallery-threshold" id="studio">
          <p className="eyebrow">05 / LET’S MAKE SOMETHING MATTER</p>
          <h2>
            Make the idea
            <br />
            <span>impossible to ignore.</span>
          </h2>
          <div>
            <p>
              A brand finding its voice. A campaign finding its nerve.
              <br />A digital world waiting to happen.
              <br />
              Bring the ambition. Let’s give it form.
            </p>
            <Link className="studio-button" href="/start">
              Start a project <ArrowUpRight size={22} />
            </Link>
          </div>
          <a className="studio-contact-link" href={"mailto:" + brand.email}>
            Start a conversation — {brand.email} ↗
          </a>
        </section>
      </main>
      <Footer />
    </div>
  );
}
