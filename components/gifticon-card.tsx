import { parseDateOnly, toDateInputValue } from "@/lib/date";
import { Gifticon } from "@/lib/types";

type GifticonCardProps = {
  item: Gifticon;
  ddayLabel: string;
};

export function GifticonCard({ item, ddayLabel }: GifticonCardProps) {
  return (
    <article className="gifticon-card">
      <p className="gifticon-title">{item.title}</p>
      <p className="gifticon-meta">
        {item.brand} · 만료 {toDateInputValue(parseDateOnly(item.expiresAt))} · {ddayLabel}
      </p>
    </article>
  );
}
