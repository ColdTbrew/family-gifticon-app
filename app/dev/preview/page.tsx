import { notFound } from "next/navigation";
import { GifticonCard } from "@/components/gifticon-card";
import { GifticonUploadForm } from "@/components/gifticon-upload-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Gifticon } from "@/lib/types";

const previewGifticon: Gifticon = {
  id: "preview-gifticon",
  title: "카페 아메리카노 T",
  brand: "스타벅스",
  barcode: "1234-5678",
  expiresAt: "2026-08-12",
  status: "available",
  imageUrl: "/icons/icon-512.png",
  usedAt: null
};

export default function DevPreviewPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <p className="text-sm font-semibold text-primary">개발 전용 UI 검증</p>
        <h1 className="text-3xl font-bold tracking-tight">로그인 이후 화면 미리보기</h1>
        <p className="text-muted-foreground">
          OAuth나 Supabase 데이터 없이 mock 데이터로 컴포넌트를 확인합니다.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>곧 만료</CardTitle>
          <CardAction>
            <Badge variant="warning">D-3</Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <GifticonCard item={previewGifticon} ddayLabel="D-3" readOnly />
        </CardContent>
      </Card>

      <GifticonUploadForm
        families={[{ id: "preview-family", name: "우리 가족", role: "owner" }]}
        readOnly
      />
    </section>
  );
}
