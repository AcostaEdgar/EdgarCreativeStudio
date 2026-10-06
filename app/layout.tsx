import type { Metadata } from "next";
import { Inter_Tight, Instrument_Serif, Geist_Mono } from "next/font/google";
import { brand } from "@/lib/brand";
import "./globals.css";
import "./artist.css";

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
  openGraph: {
    title: brand.name,
    description: brand.description,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: brand.name,
    description: brand.description,
  },
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
            __html: `(function(){var t;try{t=localStorage.getItem("edgar-artist-theme")}catch(e){}document.documentElement.dataset.theme=t==="dark"?"dark":"light"})()`,
          }}
        />
      </head>
      <body className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Edgar Acosta",
              url: "https://edgaracosta.com",
              jobTitle: "Artist and photographer",
              email: "contact@edgaracosta.com",
            }),
          }}
        />
        <div id="top">{children}</div>
      </body>
    </html>
  );
}
