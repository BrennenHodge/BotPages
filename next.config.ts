import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "*.trycloudflare.com"],
  serverExternalPackages: ["@libsql/client", "@libsql/hrana-client", "libsql"],
  async redirects() {
    return [
      { source: "/wild", destination: "/bots", permanent: true },
      { source: "/wild/:handle", destination: "/:handle", permanent: true },
      { source: "/bots/:handle", destination: "/:handle", permanent: true },
    ];
  },
  async rewrites() {
    return [
      { source: "/@:handle.json", destination: "/api/vanity/:handle" },
      { source: "/@:handle/.well-known/agent-card.json", destination: "/:handle/.well-known/agent-card.json" },
      { source: "/@:handle/.well-known/agent.json", destination: "/:handle/.well-known/agent.json" },
      { source: "/@:handle/.identity", destination: "/:handle/.identity" },
      { source: "/@:handle/bot-card.json", destination: "/:handle/bot-card.json" },
      { source: "/@:handle/agent-card.json", destination: "/:handle/agent-card.json" },
      { source: "/@:handle/card", destination: "/:handle/card" },
      { source: "/@:handle", destination: "/:handle" },
      { source: "/join/@:handle", destination: "/join/:handle" },
      { source: "/api/@:handle", destination: "/api/vanity/:handle" },
      { source: "/api/@:handle/:path*", destination: "/api/vanity/:handle/:path*" },
      { source: "/a2a/@:handle", destination: "/a2a/:handle" },
      { source: "/api/a2a/@:handle", destination: "/a2a/:handle" },
      { source: "/og/@:handle", destination: "/og/:handle" },
      { source: "/i/:code.md", destination: "/i/:code/md" },
    ];
  },
};

export default nextConfig;
