/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Google profile images for user avatars (these are NOT blocked in India)
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

module.exports = nextConfig;
