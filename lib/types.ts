export type GifticonStatus = "available" | "used" | "expired";

export type Gifticon = {
  id: string;
  title: string;
  brand: string;
  barcode: string;
  expiresAt: string;
  status: GifticonStatus;
  imageUrl: string | null;
  usedAt: string | null;
};
