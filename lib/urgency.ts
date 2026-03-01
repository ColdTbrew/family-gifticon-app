import { daysUntil } from "@/lib/date";
import { Gifticon } from "@/lib/types";

export type UrgencyEntry = {
  item: Gifticon;
  daysLeft: number;
};

export type UrgencyBuckets = {
  today: UrgencyEntry[];
  soon: UrgencyEntry[];
  caution: UrgencyEntry[];
};

export function buildUrgencyBuckets(gifticons: Gifticon[], now: Date): UrgencyBuckets {
  const available = gifticons
    .filter((item) => item.status === "available")
    .map((item) => ({ item, daysLeft: daysUntil(item.expiresAt, now) }))
    .filter((entry) => entry.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return {
    today: available.filter((entry) => entry.daysLeft === 0),
    soon: available.filter((entry) => entry.daysLeft >= 1 && entry.daysLeft <= 3),
    caution: available.filter((entry) => entry.daysLeft >= 4 && entry.daysLeft <= 7)
  };
}
