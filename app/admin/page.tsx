import { AdminWorkspace } from "@/components/admin-workspace";
import Link from "next/link";
export const metadata = { title: "Studio admin", robots:{index:false,follow:false} };
export default function AdminPage() {
 if(process.env.VERCEL)return <main className="admin-shell"><Link className="admin-back" href="/">← Back to Edgar Studio</Link><p className="eyebrow">OWNER WORKSPACE</p><h1>Studio management.</h1><p>Online editing is being connected. Your collection is available in the showroom; updates currently publish from your local studio workspace.</p><Link href="/gallery">Preview showroom ↗</Link></main>;
 return <AdminWorkspace />;
}
