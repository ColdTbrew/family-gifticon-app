"use client";

import Image from "next/image";
import { useState } from "react";
import { markGifticonAvailable, markGifticonUsed } from "@/app/gifticons/actions";
import { parseDateOnly, toDateInputValue } from "@/lib/date";
import { Gifticon } from "@/lib/types";

type GifticonCardProps = {
  item: Gifticon;
  ddayLabel: string;
};

export function GifticonCard({ item, ddayLabel }: GifticonCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const canPreview = Boolean(item.imageUrl);
  const isUsed = item.status === "used";
  const action = isUsed ? markGifticonAvailable : markGifticonUsed;
  const actionLabel = isUsed ? "사용 완료 취소" : "사용 완료";
  const usedLabel =
    isUsed && item.usedAt
      ? new Intl.DateTimeFormat("ko-KR", {
          dateStyle: "medium",
          timeStyle: "short"
        }).format(new Date(item.usedAt))
      : null;

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
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[0.95rem] font-bold text-ink">{item.title}</p>
            <p className="mt-1.5 text-sm text-muted">
              {item.brand} · 만료 {toDateInputValue(parseDateOnly(item.expiresAt))} · {ddayLabel}
            </p>
            {usedLabel ? (
              <p className="mt-2 text-xs font-medium text-[#8a5b12]">사용 완료: {usedLabel}</p>
            ) : null}
            {canPreview ? (
              <p className="mt-2 text-xs font-medium text-[#2f5ec4]">카드를 누르면 등록 이미지를 볼 수 있습니다.</p>
            ) : null}
          </div>
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
      </article>

      {isPreviewOpen && item.imageUrl ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172acc] p-4"
          onClick={() => setIsPreviewOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`${item.title} 이미지 미리보기`}
        >
          <div
            className="w-full max-w-3xl rounded-[1.75rem] bg-white p-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-bold text-ink">{item.title}</p>
                <p className="mt-1 text-sm text-muted">
                  {item.brand} · 만료 {toDateInputValue(parseDateOnly(item.expiresAt))}
                </p>
              </div>
              <button
                type="button"
                className="rounded-xl border border-line px-3 py-2 text-sm font-semibold text-ink transition hover:bg-slate-50"
                onClick={() => setIsPreviewOpen(false)}
              >
                닫기
              </button>
            </div>

            <div className="overflow-hidden rounded-[1.25rem] border border-line bg-slate-50">
              <Image
                src={item.imageUrl}
                alt={`${item.title} 등록 이미지`}
                width={1400}
                height={1400}
                className="h-auto w-full object-contain"
                unoptimized
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
