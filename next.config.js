/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost", "back.music-shop.uz", "www.back.music-shop.uz"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8808",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "back.music-shop.uz",
        pathname: "/uploads/**",
      },
    ],
  },
};

module.exports = nextConfig;
