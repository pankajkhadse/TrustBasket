import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
 // ✅ Ensure path is correct

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StreetServe - B2B Marketplace for Street Food Vendors",
  description: "Connect street food vendors with certified raw material sellers",
  generator: "v0.dev",
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
        <Toaster /> {/* ✅ Toast will now render */}
      </body>
    </html>
  );
}
