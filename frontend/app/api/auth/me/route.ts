import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export const GET = async () => {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "認証されていません" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      user: {
        id: session.userId,
        email: session.email,
        name: session.name,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 },
    );
  }
};
