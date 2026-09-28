import type { Metadata } from "next";
import { Inter_Tight, Instrument_Serif, Geist_Mono } from "next/font/google";
import { brand } from "@/lib/brand";
import { SiteAudio } from "@/components/site-audio";
import "./globals.css";
import "./gallery.css";
import "./studio.css";
import "./portfolio.css";
import "./refinements.css";

const sans = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});
const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL("https://edgaracosta.com"),
  title: { default: brand.name, template: `%s · ${brand.name}` },
  description: brand.description,
  openGraph: {title: brand.name, description: brand.description, type: "website", images: [{url:"/media/work-285691003.webp",alt:"Flower filled — Edgar Acosta"}]},
  twitter: {card:"summary_large_image",title:brand.name,description:brand.description,images:["/media/work-285691003.webp"]},
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t;try{t=localStorage.getItem("edgar-theme")}catch(e){}document.documentElement.dataset.theme=t==="light"||t==="dark"?t:matchMedia("(prefers-color-scheme:light)").matches?"light":"dark"})()`,
          }}
        />
      </head>
      <body className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
        {children}
        <SiteAudio />
      </body>
    </html>
  );
}
