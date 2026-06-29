import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options",        value: "DENY" },
  { key: "Referrer-Policy",        value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",     value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // ESPN CDN images (used via <img> in video thumbnails + flags)
      "img-src 'self' https://*.espncdn.com https://www.thesportsdb.com data: blob:",
      // Framer Motion + Tailwind need inline styles/scripts
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self'",
      // All API calls go through our own Next.js routes
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "a.espncdn.com",  pathname: "/**" },
      { protocol: "https", hostname: "a1.espncdn.com", pathname: "/**" },
      { protocol: "https", hostname: "a2.espncdn.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
