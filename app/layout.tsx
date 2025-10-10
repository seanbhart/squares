import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Squares",
  description:
    "Explore your political Squares across key policy dimensions.",
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
