/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/app/speech-synthesis/text-to-speech",
        permanent: false,
      },
      {
        source: "/sign-in",
        destination: "/app/sign-in",
        permanent: true,
      },
      {
        source: "/sign-up",
        destination: "/app/sign-up",
        permanent: true,
      },
    ];
  },
};

export default config;
 