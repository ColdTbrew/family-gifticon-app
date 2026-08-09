"use client";

import Image from "next/image";
import { markGifticonAvailable, markGifticonUsed } from "@/app/gifticons/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { formatKoreanDateTime, parseDateOnly, toDateInputValue } from "@/lib/date";
import type { Gifticon } from "@/lib/types";

type GifticonCardProps = {
  item: Gifticon;
  ddayLabel: string;
  readOnly?: boolean;
};

export function GifticonCard({ item, ddayLabel, readOnly = false }: GifticonCardProps) {
  const previewImageUrl = item.imageUrl;
  const canPreview = Boolean(previewImageUrl);
  const isUsed = item.status === "used";
  const action = isUsed ? markGifticonAvailable : markGifticonUsed;
  const actionLabel = isUsed ? "사용 완료 취소" : "사용 완료";
  const usedLabel = isUsed && item.usedAt ? formatKoreanDateTime(item.usedAt) : null;
  const expiryDate = toDateInputValue(parseDateOnly(item.expiresAt));

  return (
    <Dialog>
      <Card size="sm">
        <CardHeader>
          <CardTitle>{item.title}</CardTitle>
          <CardDescription>
            {item.brand} · 만료 {expiryDate}
          </CardDescription>
          <CardAction>
            <Badge variant={ddayLabel === "D-day" ? "destructive" : "warning"}>
              {ddayLabel}
            </Badge>
          </CardAction>
        </CardHeader>

        {canPreview || usedLabel ? (
          <CardContent className="flex items-end justify-between gap-4">
            <div className="min-w-0 flex-1">
              {usedLabel ? (
                <p className="text-xs font-medium text-warning-foreground">
                  사용 완료: {usedLabel}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">이미지를 눌러 쿠폰을 크게 봅니다.</p>
              )}
            </div>

            {canPreview ? (
              <DialogTrigger
                render={
                  <button
                    type="button"
                    className="shrink-0 overflow-hidden rounded-xl border border-border bg-card outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30"
                    aria-label={`${item.title} 이미지 크게 보기`}
                  />
                }
              >
                <Image
                  src={previewImageUrl as string}
                  alt={`${item.title} 썸네일`}
                  width={88}
                  height={116}
                  className="h-24 w-20 object-cover"
                  unoptimized
                />
              </DialogTrigger>
            ) : null}
          </CardContent>
        ) : null}

        <CardFooter>
          {readOnly ? (
            <Button type="button" size="sm" variant="outline" disabled>
              UI 프리뷰
            </Button>
          ) : (
            <form action={action}>
              <input type="hidden" name="gifticonId" value={item.id} />
              <Button type="submit" size="sm" variant={isUsed ? "outline" : "success"}>
                {actionLabel}
              </Button>
            </form>
          )}
        </CardFooter>
      </Card>

      {previewImageUrl ? (
        <DialogContent className="max-h-[calc(100vh-2rem)] max-w-3xl overflow-hidden">
          <DialogHeader>
            <DialogTitle>{item.title}</DialogTitle>
            <DialogDescription>
              {item.brand} · 만료 {expiryDate}
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 overflow-auto rounded-xl border border-border bg-muted">
            <Image
              src={previewImageUrl}
              alt={`${item.title} 등록 이미지`}
              width={1400}
              height={1400}
              className="h-auto max-h-[calc(100vh-9rem)] w-full object-contain"
              unoptimized
            />
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
