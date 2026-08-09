import type { Metadata } from "next";
import { ReactNode, Suspense } from "react";
import { Navigation } from "@/components/navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "Family Gifticon",
  description: "가족이 함께 관리하는 기프티콘 앱",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      {
        url: "/icons/family-gifticon-192.png",
        sizes: "192x192",
        type: "image/png"
      }
    ],
    apple: [
      {
        url: "/icons/family-gifticon-180.png",
        sizes: "180x180",
        type: "image/png"
      }
    ]
  },
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
        <Suspense
          fallback={
            <div
              className="min-h-[8.25rem] border-b border-line/80 bg-white/90"
              aria-hidden="true"
            />
          }
        >
          <Navigation />
        </Suspense>
        <main className="mx-auto max-w-6xl px-4 pb-12 pt-5 sm:px-6 lg:px-8">{children}</main>
      </body>
    </html>
  );
}
