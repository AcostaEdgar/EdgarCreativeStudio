import Link from "next/link";
import {brand} from "@/lib/brand";
export default function NotFound(){return <main id="main" className="empty"><p className="eyebrow">{brand.name} · 404</p><h1>Nothing here yet.</h1><Link href="/">Return to the studio ↗</Link></main>}
