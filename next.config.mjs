/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/api-client-react", "@workspace/api-zod"],
};

export default nextConfig;
