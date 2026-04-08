/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    '192.168.31.122',
    '192.168.31.*',
    '*.local',
  ],
};

module.exports = nextConfig;
