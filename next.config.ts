import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== 'production'

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options",        value: "DENY" },
  { key: "Referrer-Policy",        value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",     value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // ESPN CDN images + TheSportsDB player photos (wildcard covers all subdomains)
      "img-src 'self' https://*.espncdn.com https://*.thesportsdb.com data: blob:",
      // React/Turbopack requires 'unsafe-eval' in development mode
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
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
