/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "recharts",
    ],
  },

  // Ensure Service Worker is always re-fetched (never cached by browser/CDN)
  // This prevents stale SW from serving outdated Next.js chunks
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600",
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/dashboard/ai",
        destination: "/dashboard/ask",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
