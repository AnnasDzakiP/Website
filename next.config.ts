import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.sandbox.midtrans.com https://snap-assets.sandbox.midtrans.com https://api.sandbox.midtrans.com https://pay.google.com https://gwk.gopayapi.com https://www.googletagmanager.com;
              connect-src 'self' https://*.supabase.co wss://*.supabase.co https://asicyirapausnyphsqov.supabase.co wss://asicyirapausnyphsqov.supabase.co https://app.sandbox.midtrans.com https://api.sandbox.midtrans.com https://snap-assets.sandbox.midtrans.com https://pay.google.com https://www.google-analytics.com;
              frame-src 'self' https://app.sandbox.midtrans.com https://snap-assets.sandbox.midtrans.com https://pay.google.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              font-src 'self' data: https://fonts.gstatic.com;
              img-src 'self' data: blob: https: http:;
            `
              .replace(/\s{2,}/g, " ")
              .trim(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
