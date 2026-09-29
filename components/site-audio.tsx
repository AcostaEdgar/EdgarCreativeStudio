"use client";
/* Sound is user-controlled, with a best-effort autoplay attempt for browsers that allow it. */
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";

export function SiteAudio() {
  const pathname = usePathname();
  const preference = useRef<boolean | null>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    const element = audio.current;
    if (!element) return;
    try {
      const saved = sessionStorage.getItem("studio-sound");
      preference.current =
        saved === "off" ? false : saved === "on" ? true : null;
    } catch {}
    const attempt = () => {
      if (
        preference.current === false ||
        document.hidden ||
        location.pathname.startsWith("/admin")
      )
        return;
      element.play().catch(() => {});
    };
    const ready = () => {
      setAvailable(true);
    };
    const play = () => setPlaying(true);
    const pause = () => setPlaying(false);
    element.addEventListener("play", play);
    element.addEventListener("pause", pause);
    const ended = () => setPlaying(false);
    const firstInteraction = (event: Event) => {
      if ((event.target as HTMLElement)?.closest(".site-audio")) return;
      attempt();
    };
    element.addEventListener("canplay", ready);
    element.addEventListener("ended", ended);
    const hidden = () => {
      if (document.hidden) {
        element.pause();
        setPlaying(false);
      }
    };
    document.addEventListener("visibilitychange", hidden);
    document.addEventListener("pointerdown", firstInteraction, {
      once: true,
      passive: true,
    });
    document.addEventListener("keydown", firstInteraction, { once: true });
    if (preference.current === true) attempt();
    return () => {
      element.removeEventListener("play", play);
      element.removeEventListener("pause", pause);
      element.removeEventListener("canplay", ready);
      element.removeEventListener("ended", ended);
      document.removeEventListener("visibilitychange", hidden);
      document.removeEventListener("pointerdown", firstInteraction);
      document.removeEventListener("keydown", firstInteraction);
    };
  }, []);
  useEffect(() => {
    const element = audio.current;
    if (!element) return;
    if (pathname.startsWith("/admin")) {
      element.pause();
      return;
    }
    const target = pathname === "/gallery" ? 0.16 : 0.28;
    let frame = 0;
    const fade = () => {
      element.volume += (target - element.volume) * 0.06;
      if (Math.abs(target - element.volume) > 0.002)
        frame = requestAnimationFrame(fade);
    };
    frame = requestAnimationFrame(fade);
    return () => cancelAnimationFrame(frame);
  }, [pathname]);
  async function toggle() {
    const element = audio.current;
    if (!element) return;
    preference.current = !playing;
    try {
      sessionStorage.setItem("studio-sound", playing ? "off" : "on");
    } catch {}
    if (playing) {
      element.pause();
      setPlaying(false);
      return;
    }
    try {
      await element.play();
      setPlaying(true);
    } catch {
      setAvailable(false);
    }
  }
  return (
    <div className="site-audio" hidden={pathname.startsWith("/admin")}>
      <audio
        ref={audio}
        loop
        preload="none"
        src="/audio/out-of-flux-artificialfuture.mp3"
      />
      <button
        type="button"
        aria-pressed={playing}
        aria-label={playing ? "Pause music" : "Play music"}
        onClick={toggle}
      >
        <span className="site-audio-icon">
          {playing ? <Pause size={12} /> : <Play size={12} />}
        </span>
        <span>{playing ? "Music on" : "Soundtrack"}</span>
        <Volume2 size={13} />
      </button>
      {!available && (
        <span className="sr-only">
          Music becomes available after the audio loads.
        </span>
      )}
    </div>
  );
}
