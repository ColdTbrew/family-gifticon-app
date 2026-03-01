import type { Metadata } from "next";
import { ReactNode } from "react";
import { Navigation } from "@/components/navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "Family Gifticon",
  description: "가족이 함께 관리하는 기프티콘 앱"
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <body>
        <Navigation />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
