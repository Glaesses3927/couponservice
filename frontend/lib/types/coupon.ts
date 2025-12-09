export type CouponStatus = "available" | "used" | "expired";

export type CouponCategory = "food" | "favor" | "gift" | "activity" | "special";

export interface Coupon {
  id: string;
  title: string;
  description: string;
  category: CouponCategory;
  status: CouponStatus;
  expiryDate?: string;
  usedDate?: string;
  value?: string;
  icon?: string;
  userId: string;
}
