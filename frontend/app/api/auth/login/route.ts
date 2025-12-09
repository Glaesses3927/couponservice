import { NextResponse } from "next/server";
import { findUserByEmail, updateLastLogin, verifyPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";

export const POST = async (request: Request) => {
  try {
    const { email, password } = await request.json();

    // バリデーション
    if (!email || !password) {
      return NextResponse.json(
        { error: "メールアドレスとパスワードを入力してください" },
        { status: 400 },
      );
    }

    // ユーザー検索
    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "メールアドレスまたはパスワードが正しくありません" },
        { status: 401 },
      );
    }

    // パスワード検証
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "メールアドレスまたはパスワードが正しくありません" },
        { status: 401 },
      );
    }

    // 最終ログイン日時を更新
    await updateLastLogin(user.id);

    // セッション作成
    await createSession(user);

    return NextResponse.json({
      message: "ログインしました",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 },
    );
  }
};
