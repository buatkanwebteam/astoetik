import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { env } from "@/lib/env";
import { NavProgress } from "@/components/NavProgress";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  // Link previews (WhatsApp, social) need absolute image URLs on the real domain.
  metadataBase: new URL(env.siteUrl),
  title: { default: "Astoetik Indonesia", template: "%s - Astoetik" },
  description: "CV. Astoetik Indonesia.",
};

export const viewport: Viewport = {
  themeColor: "#6b3f1d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${bricolage.variable} ${instrument.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <NavProgress />
        {children}
      </body>
    </html>
  );
}
