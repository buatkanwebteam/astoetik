import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "ASTERA-X · Astoetik Indonesia", template: "%s · ASTERA-X" },
  description: "Scan QR produk Astoetik dan dashboard analitik pemasaran CV. Astoetik Indonesia.",
};

export const viewport: Viewport = {
  themeColor: "#6b3f1d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${fraunces.variable} ${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
