"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowUpRight, Plus, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { brand } from "@/lib/brand";

export function Navigation({home=false}:{home?:boolean}) {
 const [open,setOpen]=useState(false);
 const menu = useRef<HTMLDialogElement>(null);
 const trigger = useRef<HTMLButtonElement>(null);
 function closeMenu(){menu.current?.close();setOpen(false);document.body.style.overflow="";trigger.current?.focus()}
 return <><a className="skip" href="#main">Skip to content</a>
 <header className={home?"experience-nav":"experience-nav studio-nav-static"}>
 <Link className="experience-logo" href="/" aria-label={brand.name}>edgar<span>studio</span><sup>↗</sup><small>{brand.byline}</small></Link>
 <p className="nav-descriptor">INDEPENDENT CREATIVE STUDIO.<br/>ONE POINT OF VIEW. MANY WAYS IN.</p>
 <nav aria-label="Main navigation"><Link href="/gallery">Gallery <ArrowUpRight size={14}/></Link><ThemeToggle/><button ref={trigger} aria-expanded={open} aria-controls="studio-menu" onClick={()=>{menu.current?.showModal();setOpen(true);document.body.style.overflow="hidden"}}>Menu <Plus size={17}/></button></nav>
 <dialog ref={menu} id="studio-menu" className="studio-menu-dialog" aria-label="Explore the studio" onCancel={closeMenu} onClose={()=>{setOpen(false);document.body.style.overflow=""}}>
 <div className="studio-menu-top"><span>EDGAR ACOSTA / ONE POINT OF VIEW</span><button onClick={closeMenu} aria-label="Close menu">Close <X size={20}/></button></div>
 <div className="studio-menu-layout"><div className="studio-menu-intro"><span className="menu-orbit" aria-hidden="true">↗</span><p>Different ways in.<br/>One world to explore.</p><a href={"mailto:"+brand.email}>{brand.email} ↗</a></div><nav aria-label="Studio destinations" className="studio-menu-links">
 {[{href:"/#work",label:"Selected work"},{href:"/gallery",label:"The showroom"},{href:"/#studio",label:"The studio"},{href:"mailto:"+brand.email,label:"Start a project"}].map((item,i)=><Link key={item.href} href={item.href} onClick={closeMenu}><small>0{i+1}</small><span>{item.label}</span><ArrowUpRight/></Link>)}
 </nav></div><div className="studio-menu-bottom"><span>STRATEGY · WORDS · IMAGES · DIGITAL WORLDS</span><Link href="/admin" onClick={closeMenu}>Studio login ↗</Link></div>
 </dialog>
 </header></>;
}
