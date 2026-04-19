import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vyapar Mitra - B2B Marketplace for Street Food Vendors",
  description:
    "Vyapar Mitra connects street food vendors with verified raw material suppliers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
