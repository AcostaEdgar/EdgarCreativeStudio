import type { NextConfig } from "next";
const config: NextConfig = {
  distDir: process.env.STUDIO_TEST_DIST_DIR || ".next",
  images: { qualities: [75, 80] },
  async redirects() {
    const routes=["join","signup","login","discover","following","library","account","studio","confirm","unsubscribe","about-demo","portfolio-preview","historical","_design","salvador-dali","vincent-van-gogh","claude-monet","form-lab","chroma-studio","liminal-visions","future-archaeology","memory-archive","other-terrain","georges-seurat","pierre-auguste-renoir","hilaire-germain-edgar-degas","gustave-caillebotte","thomas-cole","katsushika-hokusai"];
    return [{source:"/edgaracosta/:path*",destination:"/gallery",permanent:true}, ...routes.map(route=>({source:"/"+route+"/:path*",destination:"/",permanent:true})),{source:"/api/platform/:path*",destination:"/",permanent:true},{source:"/api/media/:path*",destination:"/",permanent:true}];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};
export default config;
