/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
    pageExtensions: [
      "page.tsx",
      "page.ts",
      "ts"
  
  ]
  }
};

module.exports = nextConfig;
