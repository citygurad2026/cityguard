import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['res.cloudinary.com'], // <-- هنا اسم دومين Cloudinary
  },
};

export default nextConfig;
