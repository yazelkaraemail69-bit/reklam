import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Isletmeler kendi gorsel URL'lerini (herhangi bir CDN/host) admin panelinden
    // girebildigi icin optimizasyon proxy'sini kapatiyoruz. Bu hem SSRF riskini
    // ortadan kaldirir hem de remotePatterns bakimi gerektirmez. next/image
    // bilesenin lazy-loading ve layout-shift onleme faydalari yine gecerlidir.
    unoptimized: true,
  },
};

export default nextConfig;
