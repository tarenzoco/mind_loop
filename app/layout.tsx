import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import RegisterSW from "./register-sw"; // ✅ Import Service Worker Registration

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ Metadata (SEO, PWA info)
export const metadata: Metadata = {
  title: "Mind Loop — by TARENZO.CO",
  description: "Calm, premium affirmation sessions — built for flow and clarity.",
  icons: {
    icon: "/icons/brand-orb.png",
    shortcut: "/icons/brand-orb.png",
    apple: "/icons/ios/icon-180.png",
  },
  manifest: "/manifest.json",
};

// ✅ Viewport (fixes warning)
export const viewport: Viewport = {
  themeColor: "#0b1220",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* ✅ PWA + Cross-Device Meta */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Mind Loop" />
        <meta name="apple-mobile-web-app-title" content="Mind Loop" />
        <meta name="theme-color" content="#0b1220" />
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="icon"
          href="/icons/brand-orb.png"
          sizes="512x512"
          type="image/png"
        />
        <link rel="apple-touch-icon" href="/icons/ios/icon-180.png" />
        <meta name="msapplication-TileColor" content="#0b1220" />
        <meta
          name="msapplication-TileImage"
          content="/icons/windows/square-150.png"
        />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0b1220] text-white`}
      >
        {/* ✅ Registers service worker when app loads */}
        <RegisterSW />

        {/* ✅ Page content */}
        {children}
      </body>
    </html>
  );
}
