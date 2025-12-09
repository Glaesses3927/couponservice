import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/session";

export const POST = async () => {
  try {
    await deleteSession();

    return NextResponse.json({
      message: "ログアウトしました",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 },
    );
  }
};
