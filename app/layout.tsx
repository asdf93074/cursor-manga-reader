import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientLayout } from '@/app/client-layout';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Manga Reader - Read Your Favorite Manga Online",
  description: "A modern manga reader built with Next.js. Read your favorite manga online with a clean, responsive interface.",
  keywords: ["manga", "reader", "online", "nextjs", "mangadex"],
  authors: [{ name: "Your Name" }],
  openGraph: {
    title: "Manga Reader - Read Your Favorite Manga Online",
    description: "A modern manga reader built with Next.js. Read your favorite manga online with a clean, responsive interface.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Manga Reader - Read Your Favorite Manga Online",
    description: "A modern manga reader built with Next.js. Read your favorite manga online with a clean, responsive interface.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
