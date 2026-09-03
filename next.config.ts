import type { NextConfig } from 'next';

// The Cloudflare Sites deployment is the default. VINEXT_STATIC_EXPORT switches
// the build to static-host settings for a host with no server or image
// optimiser, such as GitHub Pages, and NEXT_PUBLIC_BASE_PATH serves it from a
// sub-path there. The page itself is emitted by scripts/build-static.mjs.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const staticExport = process.env.VINEXT_STATIC_EXPORT === '1';

const nextConfig: NextConfig = staticExport
  ? {
      images: { unoptimized: true },
      trailingSlash: true,
      ...(basePath ? { basePath } : {}),
    }
  : {};

export default nextConfig;
