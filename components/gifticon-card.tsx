"use client";

import Image from "next/image";
import { useState } from "react";
import { markGifticonAvailable, markGifticonUsed } from "@/app/gifticons/actions";
import { formatKoreanDateTime, parseDateOnly, toDateInputValue } from "@/lib/date";
import { Gifticon } from "@/lib/types";

type GifticonCardProps = {
  item: Gifticon;
  ddayLabel: string;
};

export function GifticonCard({ item, ddayLabel }: GifticonCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const previewImageUrl = item.imageUrl;
  const canPreview = Boolean(previewImageUrl);
  const skipImageOptimization = previewImageUrl ? needsOriginalImage(previewImageUrl) : false;
  const isUsed = item.status === "used";
  const action = isUsed ? markGifticonAvailable : markGifticonUsed;
  const actionLabel = isUsed ? "사용 완료 취소" : "사용 완료";
  const usedLabel = isUsed && item.usedAt ? formatKoreanDateTime(item.usedAt) : null;

  return (
    <>
      <article
        className={`rounded-2xl border border-line bg-slate-50/80 p-4 shadow-sm transition ${
          canPreview ? "cursor-pointer hover:border-[#b8c7eb] hover:bg-white" : ""
        }`}
        onClick={() => {
          if (canPreview) {
            setIsPreviewOpen(true);
          }
        }}
      >
        <div className="flex items-stretch justify-between gap-4">
          <div className="flex min-w-0 flex-1 flex-col justify-between">
            <div>
              <p className="text-[0.95rem] font-bold text-ink">{item.title}</p>
              <p className="mt-1.5 text-sm text-muted">
                {item.brand} · 만료 {toDateInputValue(parseDateOnly(item.expiresAt))} · {ddayLabel}
              </p>
              {usedLabel ? (
                <p className="mt-2 text-xs font-medium text-[#8a5b12]">사용 완료: {usedLabel}</p>
              ) : null}
            </div>

            <form
              action={action}
              className="mt-3"
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              <input type="hidden" name="gifticonId" value={item.id} />
              <button
                type="submit"
                className={`rounded-xl border bg-white px-3 py-2 text-sm font-semibold transition ${
                  isUsed
                    ? "border-[#e6c88d] text-[#8a5b12] hover:bg-[#fff8eb]"
                    : "border-[#b9dcc7] text-[#22613a] hover:bg-[#f3fbf6]"
                }`}
              >
                {actionLabel}
              </button>
            </form>
          </div>

          {canPreview ? (
            <div className="shrink-0 overflow-hidden rounded-2xl border border-line bg-white">
              <Image
                src={previewImageUrl as string}
                alt={`${item.title} 썸네일`}
                width={88}
                height={116}
                sizes="(max-width: 640px) 64px, 80px"
                className="h-full min-h-20 w-16 object-cover sm:min-h-24 sm:w-20"
                unoptimized={skipImageOptimization}
              />
            </div>
          ) : null}
        </div>
      </article>

      {isPreviewOpen && previewImageUrl ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172acc] p-3 sm:p-4"
          onClick={() => setIsPreviewOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`${item.title} 이미지 미리보기`}
        >
          <div
            className="flex max-h-[calc(100vh-1.5rem)] w-full max-w-3xl flex-col rounded-[1.75rem] bg-white p-3 shadow-2xl sm:max-h-[calc(100vh-2rem)] sm:p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex shrink-0 items-start justify-between gap-3">
              <div>
                <p className="text-base font-bold text-ink sm:text-lg">{item.title}</p>
                <p className="mt-1 text-xs text-muted sm:text-sm">
                  {item.brand} · 만료 {toDateInputValue(parseDateOnly(item.expiresAt))}
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-xl border border-line px-3 py-2 text-sm font-semibold text-ink transition hover:bg-slate-50"
                onClick={() => setIsPreviewOpen(false)}
              >
                닫기
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-auto rounded-[1.25rem] border border-line bg-slate-50">
              <Image
                src={previewImageUrl}
                alt={`${item.title} 등록 이미지`}
                width={1400}
                height={1400}
                sizes="(max-width: 768px) calc(100vw - 48px), 768px"
                className="h-auto max-h-[calc(100vh-9rem)] w-full object-contain sm:max-h-[calc(100vh-10rem)]"
                unoptimized={skipImageOptimization}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function needsOriginalImage(imageUrl: string): boolean {
  return /\.(heic|heif)(?:\?|$)/i.test(imageUrl);
}
