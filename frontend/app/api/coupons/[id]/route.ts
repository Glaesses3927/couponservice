import { NextResponse } from "next/server";
import { isPageObjectResponse } from "@/lib/auth";
import {
  isExpired,
  mapCouponToNotionProperties,
  mapNotionPageToCoupon,
  notion,
} from "@/lib/coupon";
import { sendCouponUsedNotification } from "@/lib/discord";
import { getSession } from "@/lib/session";
import { checkExpiry } from "../route";

// 特定のクーポンを取得
export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await params;

    const page = await notion.pages.retrieve({ page_id: id });
    if (!isPageObjectResponse(page)) {
      return NextResponse.json(
        { error: "Notion page not found" },
        { status: 404 },
      );
    }
    const coupon = mapNotionPageToCoupon(page);

    return NextResponse.json({ coupon: await checkExpiry(coupon) });
  } catch (error) {
    console.error("Notion API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch coupon",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
};

// クーポンを更新（使用状態の変更など）
export const PATCH = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await params;
    const body = await request.json();

    // 使用処理の前に、最新の状態を取得して期限切れ/使用済みを確認
    if (body.status === "used") {
      const currentPage = await notion.pages.retrieve({ page_id: id });
      if (!isPageObjectResponse(currentPage)) {
        return NextResponse.json(
          { error: "Invalid Notion page" },
          { status: 500 },
        );
      }
      const current = mapNotionPageToCoupon(currentPage);
      if (current.status === "used") {
        return NextResponse.json(
          { error: "このクーポンはすでに使用済みです" },
          { status: 400 },
        );
      }
      if (isExpired(current.expiryDate)) {
        return NextResponse.json(
          { error: "有効期限切れのため使用できません" },
          { status: 400 },
        );
      }
    }

    const properties = mapCouponToNotionProperties(body);

    const response = await notion.pages.update({
      page_id: id,
      properties: properties,
    });
    if (!isPageObjectResponse(response)) {
      return NextResponse.json(
        { error: "Invalid Notion response" },
        { status: 500 },
      );
    }
    const coupon = mapNotionPageToCoupon(response);

    if (body.status === "used") {
      const session = await getSession();
      const userName = session?.name || "不明なユーザー";

      // Discord通知を同期的に送信（エラーがあっても処理は続行）
      try {
        await sendCouponUsedNotification(coupon, userName);
      } catch (error) {
        console.error("Discord notification failed:", error);
        // 通知失敗してもクーポン更新は成功させる
      }
    }

    return NextResponse.json({ coupon });
  } catch (error) {
    console.error("Notion API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to update coupon",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
};
