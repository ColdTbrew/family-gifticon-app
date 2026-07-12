import type { Metadata } from "next";
import { ReactNode } from "react";
import { Navigation } from "@/components/navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "Family Gifticon",
  description: "가족이 함께 관리하는 기프티콘 앱",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "가족 기프티콘"
  }
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <body>
        <Navigation />
        <main className="mx-auto max-w-6xl px-4 pb-12 pt-5 sm:px-6 lg:px-8">{children}</main>
      </body>
    </html>
  );
}
