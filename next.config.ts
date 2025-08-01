import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images:{
    remotePatterns: [
      {
        protocol: "https",
        hostname: "robinnayak.github.io",
        port: "",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
        pathname: "/**"
      }
    ]
  }
};

export default nextConfig;
