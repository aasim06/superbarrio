import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const svgrLoader = {
  loader: "@svgr/webpack",
  options: {
    svgoConfig: {
      plugins: [
        {
          name: "preset-default",
          params: {
            overrides: {
              removeViewBox: false,
            },
          },
        },
      ],
    },
  },
};

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "sonner",
      "clsx",
      "tailwind-merge",
    ],
  },
  serverExternalPackages: [
    "@whiskeysockets/baileys",
    "link-preview-js",
    "node-edge-tts",
    "firebase-admin",
  ],
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [svgrLoader],
    });
    return config;
  },
  images: {
    // Modern formats: AVIF first (best compression), WebP fallback
    formats: ["image/avif", "image/webp"],
    // 24-hour client/edge cache for optimized images
    minimumCacheTTL: 86400,
    // Responsive device widths for srcset generation
    deviceSizes: [390, 640, 750, 828, 1080, 1200, 1920],
    // Image sizes for fixed-width images (product cards, thumbnails)
    imageSizes: [48, 64, 96, 128, 192, 256, 384],
    remotePatterns: [
      // Unsplash CDN (product images and banners)
      { protocol: "https", hostname: "images.unsplash.com" },
      // Common CDN patterns for future-proofing
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "**.imgix.net" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "**.googleapis.com" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
    ],
    localPatterns: [
      {
        pathname: "/**",
      },
    ],
  },
  turbopack: {
    root: __dirname,
    rules: {
      "*.svg": {
        loaders: [svgrLoader],
        as: "*.js",
      },
    },
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/api/uploads/:path*",
      },
    ];
  },
};

export default withNextIntl(nextConfig);
