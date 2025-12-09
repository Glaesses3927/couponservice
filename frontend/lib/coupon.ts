import {
  Client,
  type PageObjectResponse,
  type UpdatePageParameters,
} from "@notionhq/client";
import type { Coupon, CouponCategory, CouponStatus } from "@/lib/types/coupon";

// Notion クライアントの初期化
export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID || "";

/**
 * 有効期限切れ判定
 * - 日付のみ(YYYY-MM-DD)の場合はその日の23:59:59.999まで有効とみなす
 * - 時刻付きISOの場合はその時刻で判定
 */
export const isExpired = (
  expiryDate?: string,
  now: Date = new Date(),
): boolean => {
  if (!expiryDate) return false;

  // YYYY-MM-DD のみの場合は当日の終端を採用（ローカルタイム）
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
  const end = dateOnly.test(expiryDate)
    ? new Date(`${expiryDate}T23:59:59.999`)
    : new Date(expiryDate);

  return end.getTime() < now.getTime();
};

/**
 * Notionのページをクーポンにマッピング
 * @param page
 * @returns Coupon
 */
export const mapNotionPageToCoupon = (page: PageObjectResponse): Coupon => {
  const properties = page.properties;

  return {
    id: page.id,
    userId:
      properties.userId?.type === "rich_text"
        ? properties.userId.rich_text?.[0]?.plain_text || ""
        : "",
    title:
      properties.title?.type === "title"
        ? properties.title.title?.[0]?.plain_text || ""
        : "",
    description:
      properties.description?.type === "rich_text"
        ? properties.description.rich_text?.[0]?.plain_text || ""
        : "",
    category: (properties.category?.type === "select"
      ? properties.category.select?.name?.toLowerCase() || "special"
      : "special") as CouponCategory,
    status: (properties.status?.type === "select"
      ? properties.status.select?.name?.toLowerCase() || "available"
      : "available") as CouponStatus,
    expiryDate:
      properties.expiryDate?.type === "date"
        ? properties.expiryDate.date?.start || undefined
        : undefined,
    usedDate:
      properties.usedDate?.type === "date"
        ? properties.usedDate.date?.start || undefined
        : undefined,
    value:
      properties.value?.type === "rich_text"
        ? properties.value.rich_text?.[0]?.plain_text || undefined
        : undefined,
  };
};

export const mapCouponToNotionProperties = (
  coupon: Partial<Coupon>,
): UpdatePageParameters["properties"] => {
  const properties: NonNullable<UpdatePageParameters["properties"]> = {};

  if (coupon.title !== undefined) {
    properties.title = {
      title: [{ text: { content: coupon.title } }],
    };
  }

  if (coupon.description !== undefined) {
    properties.description = {
      rich_text: [
        {
          text: { content: coupon.description },
        },
      ],
    };
  }

  if (coupon.userId !== undefined) {
    properties.userId = {
      rich_text: coupon.userId ? [{ text: { content: coupon.userId } }] : [],
    };
  }

  if (coupon.category !== undefined) {
    properties.category = {
      select: { name: coupon.category },
    };
  }

  if (coupon.status !== undefined) {
    properties.status = {
      select: { name: coupon.status },
    };
  }

  if (coupon.expiryDate !== undefined) {
    properties.expiryDate = {
      date: coupon.expiryDate ? { start: coupon.expiryDate } : null,
    };
  }

  if (coupon.usedDate !== undefined) {
    properties.usedDate = {
      date: coupon.usedDate ? { start: coupon.usedDate } : null,
    };
  }

  if (coupon.value !== undefined) {
    properties.value = {
      rich_text: coupon.value ? [{ text: { content: coupon.value } }] : [],
    };
  }

  return properties;
};

/**
 * クーポン一覧を取得
 * @param userId string | undefined
 * @returns Promise<Coupon[]>
 */
export const fetchCoupons = async (userId?: string): Promise<Coupon[]> => {
  try {
    if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
      return [];
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const url = userId
      ? `${baseUrl}/api/coupons?userId=${encodeURIComponent(userId)}`
      : `${baseUrl}/api/coupons`;

    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch coupons: ${response.statusText}`);
    }

    const data = await response.json();
    return data.coupons;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return [];
  }
};

/**
 * 特定のクーポンを取得
 * @param id string
 * @return Promise<Coupon | null>
 */
export const fetchCoupon = async (id: string): Promise<Coupon | null> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/coupons/${id}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch coupon: ${response.statusText}`);
    }

    const data = await response.json();
    return data.coupon;
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return null;
  }
};

/**
 * クーポンを更新（使用状態の変更など）
 * @param id string
 * @param updates Partial<Coupon>
 */
export const updateCoupon = async (
  id: string,
  updates: Partial<Coupon>,
): Promise<Coupon | null> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/coupons/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update coupon: ${response.statusText}`);
    }

    const data = await response.json();
    return data.coupon;
  } catch (error) {
    console.error("Error updating coupon:", error);
    return null;
  }
};
