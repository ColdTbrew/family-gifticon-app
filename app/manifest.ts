import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "가족 기프티콘",
    short_name: "기프티콘",
    description: "가족이 함께 관리하는 기프티콘 앱",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f6f8fc",
    theme_color: "#132235",
    lang: "ko-KR",
    icons: [
      {
        src: "/icons/family-gifticon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/family-gifticon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}
