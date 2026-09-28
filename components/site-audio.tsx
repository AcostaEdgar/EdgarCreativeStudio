"use client";
/* Sound is user-controlled, with a best-effort autoplay attempt for browsers that allow it. */
import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";

export function SiteAudio() {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    const element = audio.current;
    if (!element) return;
    const attempt = () => { element.play().then(() => setPlaying(true)).catch(() => {}); };
    const ready = () => { setAvailable(true); attempt(); };
    const ended = () => setPlaying(false);
    const firstInteraction = () => { attempt(); };
    element.addEventListener("canplay", ready);
    element.addEventListener("ended", ended);
    const hidden = () => { if (document.hidden) { element.pause(); setPlaying(false); } };
    document.addEventListener("visibilitychange", hidden);
    document.addEventListener("pointerdown", firstInteraction, { once: true, passive: true });
    document.addEventListener("keydown", firstInteraction, { once: true });
    element.autoplay = true;
    attempt();
    return () => { element.removeEventListener("canplay", ready); element.removeEventListener("ended", ended); document.removeEventListener("visibilitychange", hidden); document.removeEventListener("pointerdown", firstInteraction); document.removeEventListener("keydown", firstInteraction); };
  }, []);
  async function toggle() {
    const element = audio.current;
    if (!element) return;
    if (playing) { element.pause(); setPlaying(false); return; }
    try { await element.play(); setPlaying(true); } catch { setAvailable(false); }
  }
  return <div className="site-audio"><audio ref={audio} preload="auto" src="/audio/out-of-flux-artificialfuture.mp3"/><button type="button" aria-pressed={playing} aria-label={playing ? "Pause music" : "Play music"} onClick={toggle}><span className="site-audio-icon">{playing ? <Pause size={12}/> : <Play size={12}/>}</span><span>{playing ? "Music on" : "Soundtrack"}</span><Volume2 size={13}/></button>{!available&&<span className="sr-only">Music becomes available after the audio loads.</span>}</div>;
}
