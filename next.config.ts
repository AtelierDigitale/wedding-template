import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    // In production, proxy /api/* calls to the SiteGround backend
    if (apiUrl && apiUrl !== "local") {
      return [
        {
          source: "/api/inviti",
          destination: `${apiUrl}/api/inviti.php`,
        },
        {
          source: "/api/invito",
          destination: `${apiUrl}/api/invito.php`,
        },
        {
          source: "/api/conferma",
          destination: `${apiUrl}/api/conferma.php`,
        },
        {
          source: "/api/upload",
          destination: `${apiUrl}/api/upload.php`,
        },
        {
          source: "/api/gallery",
          destination: `${apiUrl}/api/gallery.php`,
        },
        {
          source: "/api/gruppi",
          destination: `${apiUrl}/api/gruppi.php`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
