"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDown, Pause, Play } from "lucide-react";
import { Navigation } from "../navigation";
import { Footer } from "../footer";
import { WorldScene } from "./world-scene";
import { PortfolioTiles } from "../portfolio-tiles";
import { brand } from "@/lib/brand";
import slots from "@/content/home-media.json";
import "./experience.css";

export function HomeExperience(){
 const [paused,setPaused]=useState(false);
 const [active,setActive]=useState(slots.hero.length > 1 ? 1 : 0);
 const scroll=useRef<HTMLElement>(null),video=useRef<HTMLVideoElement>(null);
 useEffect(()=>{
  const el=scroll.current;if(!el)return;
  const reduced=matchMedia("(prefers-reduced-motion: reduce)");
  let frame=0;
  const update=()=>{frame=0;const rect=el.getBoundingClientRect();const p=reduced.matches||paused?0:Math.max(0,Math.min(1,-rect.top/Math.max(1,el.offsetHeight-innerHeight)));el.style.setProperty("--travel",String(p));};
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
  update();addEventListener("scroll",schedule,{passive:true});addEventListener("resize",schedule);reduced.addEventListener("change",schedule);
  return()=>{cancelAnimationFrame(frame);removeEventListener("scroll",schedule);removeEventListener("resize",schedule);reduced.removeEventListener("change",schedule)};
 },[paused]);
 useEffect(()=>{
  const el=video.current;if(!el)return;
  const reduced=matchMedia("(prefers-reduced-motion: reduce)");
  const connection=(navigator as Navigator&{connection?:{saveData?:boolean}}).connection;
  let visible=false;
  const update=()=>{if(paused||reduced.matches||connection?.saveData||!visible||document.hidden)el.pause();else el.play().catch(()=>{})};
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update()},{threshold:.05});
  observer.observe(el);reduced.addEventListener("change",update);document.addEventListener("visibilitychange",update);update();
  return()=>{observer.disconnect();reduced.removeEventListener("change",update);document.removeEventListener("visibilitychange",update);el.pause()};
 },[paused]);
 const control=<button className="motion-control" aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?<Play size={13}/>:<Pause size={13}/>} {paused?"RESUME MOTION":"PAUSE MOTION"}</button>;
 return <div className={`experience ${paused?"motion-paused":""}`}><main id="main">
 <section ref={scroll} className="experience-scroll" aria-label="The entrance"><div className="experience-stage"><Navigation home/><div className="stage-grid"/><div className="stage-topline"><span><i/> A SPACE FOR THE UNEXPECTED</span><span>EDGAR ACOSTA / CREATIVE STUDIO</span></div>
 <div className="portal-scene"><WorldScene paused={paused} active={active}/></div>
 <div className="experience-title"><h1>WORLD<br/><span>WITHIN.</span></h1></div>
 <div className="experience-side"><span className="eyebrow">LOOK A LITTLE LONGER.</span><p>One perspective.<br/>Many ways to make it matter.</p><Link className="enter-gallery" href="/gallery">Enter the showroom <ArrowUpRight size={20}/></Link></div>
 <div className="scene-caption"><span>CHOOSE A PERSPECTIVE</span><div className="scene-selectors">{slots.hero.map((item,i)=><button key={item.id} aria-label={`Perspective ${i+1}: ${item.caption}`} aria-pressed={active===i} onClick={()=>setActive(i)}>{String(i+1).padStart(2,"0")}</button>)}</div></div>
 <div className="portal-end"><p>Step inside my world.</p><span className="eyebrow">PHOTOGRAPHY · PAINTING · IDEAS</span></div>
 <div className="experience-bottom"><a href="#motion" className="scroll-cue"><span className="scroll-line"/> SCROLL INTO ANOTHER WORLD <ArrowDown size={14}/></a>{control}<span className="experience-index">01 / THE ENTRANCE</span></div>
 </div></section>
 <section id="motion" className="motion-interlude" aria-label="Motion study"><video ref={video} muted loop playsInline preload="metadata" poster="/motion/ink-poster.jpg" aria-label="Flowing colored ink motion study"><source src="/motion/ink-flow.mp4" type="video/mp4"/></video><div className="interlude-shade"/><p className="eyebrow">02 / A DIFFERENT PERSPECTIVE</p><div className="interlude-control">{control}</div><h2>FEEL SOMETHING<br/><span>DIFFERENT.</span></h2><div className="interlude-bottom"><p>Images that stay with you.<br/>A world that moves around you.</p><a className="motion-credit" href="https://mixkit.co/free-stock-video/vibrant-colored-inks-interacting-with-a-black-liquid-creating-flowing-99927/" target="_blank" rel="noreferrer">MOTION FOOTAGE / MIXKIT ↗</a><a href="#work" aria-label="Explore selected work"><ArrowDown/></a></div></section>
 <section id="work"><PortfolioTiles/></section>
 <section className="studio-practice"><div className="studio-practice-intro"><p className="eyebrow">03 / THE PRACTICE</p><h2>Clear thinking.<br/><em>Distinct feeling.</em></h2><p>I help ambitious ideas find the shape, language, and atmosphere that makes them impossible to confuse with anything else.</p></div><div className="studio-practice-grid"><article><span>01</span><h3>Position</h3><p>Brand strategy and consultation that turn instinct into a clear direction people can act on.</p></article><article><span>02</span><h3>Express</h3><p>Copy, art direction, and marketing that give the idea a voice with enough character to stay remembered.</p></article><article><span>03</span><h3>Build</h3><p>Web design and digital worlds that make the point of view tangible, responsive, and ready to move.</p></article></div><div className="studio-process"><span>FIND THE TENSION</span><span>SHAPE THE STORY</span><span>BUILD THE WORLD</span><span>MAKE IT MOVE</span></div></section>
 <section className="gallery-threshold" id="studio"><p className="eyebrow">04 / THE STUDIO OF EDGAR ACOSTA</p><h2>Make the idea<br/><span>impossible to ignore.</span></h2><div><span className="threshold-cross">✳</span><p>Brand strategy, consultation, copy, art direction,<br/>marketing, and web design — brought into one world<br/>with a voice people can recognize and remember.</p><Link href="/gallery" aria-label="Enter Edgar's 3D showroom"><ArrowUpRight size={32}/></Link></div><a className="studio-contact-link" href={"mailto:"+brand.email}>Start a conversation — {brand.email} ↗</a></section>
 </main><Footer/></div>;
}
