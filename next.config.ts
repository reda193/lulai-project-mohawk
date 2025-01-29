/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add this to help debug build issues
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