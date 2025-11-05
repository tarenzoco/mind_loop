/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false, // disable SWC (causing Linux build issues)
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

module.exports = nextConfig;
