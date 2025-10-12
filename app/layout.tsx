import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://squares.vote'),
  title: {
    default: "squares.vote",
    template: "%s | Squares"
  },
  description:
    "Political labels are broken. You're not one word—you're many dimensions. Map your positions on Trade, Abortion, Migration, Economics, and Rights with TAME-R.",
  keywords: [
    "political compass",
    "political spectrum",
    "TAME-R",
    "political assessment",
    "political positions",
    "political quiz",
    "political test",
    "ideology mapping"
  ],
  authors: [{ name: "Squares" }],
  creator: "Squares",
  publisher: "Squares",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://squares.vote",
    siteName: "Squares",
    title: "squares.vote",
    description:
      "Political labels are broken. You're not one word—you're many dimensions. Map your positions on Trade, Abortion, Migration, Economics, and Rights.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "squares.vote",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "squares.vote",
    description:
      "Political labels are broken. You're not one word—you're many dimensions. Map yours with TAME-R.",
    images: ["/twitter-image.png"],
    creator: "@squares-app",
    site: "@squares.vote",
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-sm.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "android-chrome",
        url: "/android-icon-192x192.png",
      },
    ],
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
