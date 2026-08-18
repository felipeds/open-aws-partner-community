/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    BACKEND_URL: process.env.BACKEND_URL || "http://localhost:8000",
  },
}

export default nextConfig
