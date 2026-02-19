import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Azora Stack - Premium Code Marketplace",
    template: "%s | Azora Stack"
  },
  description: "Buy and sell production-ready code projects. India's premier marketplace for developers. Get instant access to premium software projects.",
  keywords: ["SaaS marketplace", "code marketplace", "software projects", "buy code", "sell code", "developers", "India", "premium projects", "production-ready"],
  authors: [{ name: "Azora Stack" }],
  creator: "Azora Stack",
  publisher: "Azora Stack",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: "Azora Stack - Premium Code Marketplace",
    description: "Buy and sell production-ready code projects. Get instant access to premium software.",
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: "Azora Stack",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Azora Stack - Premium Code Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Azora Stack - Premium Code Marketplace",
    description: "Buy and sell production-ready code projects",
    images: ["/og-image.png"],
    creator: "@azorastack",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
