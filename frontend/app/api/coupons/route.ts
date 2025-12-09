import { NextResponse } from "next/server";
import { isPageObjectResponse } from "@/lib/auth";
import {
  isExpired,
  mapCouponToNotionProperties,
  mapNotionPageToCoupon,
  NOTION_DATABASE_ID,
  notion,
} from "@/lib/coupon";
import type { Coupon } from "@/lib/types/coupon";

export const checkExpiry = async (coupon: Coupon): Promise<Coupon> => {
  if (coupon.status !== "expired" && isExpired(coupon.expiryDate)) {
    try {
      const properties = mapCouponToNotionProperties({
        status: "expired",
      });
      const updated = await notion.pages.update({
        page_id: coupon.id,
        properties,
      });
      if (isPageObjectResponse(updated)) {
        return mapNotionPageToCoupon(updated);
      }
    } catch (e) {
      console.error("Failed to sync expired status:", e);
    }
  }
  return coupon;
};

// クーポン一覧を取得
export const GET = async (request: Request) => {
  try {
    if (!process.env.NOTION_API_KEY || !NOTION_DATABASE_ID) {
      return NextResponse.json(
        {
          error: "Notion API is not configured",
          message:
            "NOTION_API_KEY または NOTION_DATABASE_ID が設定されていません。",
        },
        { status: 503 },
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const queryOptions: Parameters<typeof notion.dataSources.query>[0] = {
      data_source_id: NOTION_DATABASE_ID,
      sorts: [
        {
          property: "status",
          direction: "ascending",
        },
      ],
    };

    if (userId) {
      queryOptions.filter = {
        property: "userId",
        rich_text: {
          equals: userId,
        },
      };
    }

    const response = await notion.dataSources.query(queryOptions);

    const coupons = await Promise.all(
      response.results.map(async (page) => {
        if (!isPageObjectResponse(page)) {
          return null;
        }

        const coupon = mapNotionPageToCoupon(page);
        return await checkExpiry(coupon);
      }),
    );

    return NextResponse.json({ coupons: coupons.filter(Boolean) });
  } catch (error) {
    console.error("Notion API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch coupons",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
};
