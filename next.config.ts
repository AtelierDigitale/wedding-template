import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl && apiUrl !== "local") {
      return [
        { source: "/api/inviti", destination: `${apiUrl}/siteground-api/api/inviti.php` },
        { source: "/api/invito", destination: `${apiUrl}/siteground-api/api/invito.php` },
        { source: "/api/conferma", destination: `${apiUrl}/siteground-api/api/conferma.php` },
        { source: "/api/upload", destination: `${apiUrl}/siteground-api/api/upload.php` },
        { source: "/api/gallery", destination: `${apiUrl}/siteground-api/api/gallery.php` },
        { source: "/api/gruppi", destination: `${apiUrl}/siteground-api/api/gruppi.php` },
      ];
    }
    return [];
  },
};

export default nextConfig;
