import type { NextConfig } from "next";
/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  images: {
    domains: ['images.unsplash.com'],
  },
};

// module.exports = {
//   experimental: {
//     turbopack: false, // Desativa o Turbopack
//   },
// };

export default nextConfig;
