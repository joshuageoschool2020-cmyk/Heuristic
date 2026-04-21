import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Heuristic",
  description: "Understand anything. In your language. At your level."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
