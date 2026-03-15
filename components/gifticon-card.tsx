import { parseDateOnly, toDateInputValue } from "@/lib/date";
import { Gifticon } from "@/lib/types";

type GifticonCardProps = {
  item: Gifticon;
  ddayLabel: string;
};

export function GifticonCard({ item, ddayLabel }: GifticonCardProps) {
  return (
    <article className="rounded-2xl border border-line bg-slate-50/80 p-4 shadow-sm">
      <p className="text-[0.95rem] font-bold text-ink">{item.title}</p>
      <p className="mt-1.5 text-sm text-muted">
        {item.brand} · 만료 {toDateInputValue(parseDateOnly(item.expiresAt))} · {ddayLabel}
      </p>
    </article>
  );
}
