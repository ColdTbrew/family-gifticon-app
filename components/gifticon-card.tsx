import { markGifticonUsed } from "@/app/gifticons/actions";
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
      <form action={markGifticonUsed} className="mt-3">
        <input type="hidden" name="gifticonId" value={item.id} />
        <button
          type="submit"
          className="rounded-xl border border-[#b9dcc7] bg-white px-3 py-2 text-sm font-semibold text-[#22613a] transition hover:bg-[#f3fbf6]"
        >
          사용 완료
        </button>
      </form>
    </article>
  );
}
