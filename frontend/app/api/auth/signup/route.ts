import { NextResponse } from "next/server";
import { createUser, findUserByEmail, hashPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";

export const POST = async (request: Request) => {
  try {
    const { email, name, password } = await request.json();

    // バリデーション
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "すべてのフィールドを入力してください" },
        { status: 400 },
      );
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "有効なメールアドレスを入力してください" },
        { status: 400 },
      );
    }

    // パスワードの長さチェック
    if (password.length < 8) {
      return NextResponse.json(
        { error: "パスワードは8文字以上である必要があります" },
        { status: 400 },
      );
    }

    // 既存ユーザーのチェック
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "このメールアドレスは既に登録されています" },
        { status: 409 },
      );
    }

    // パスワードのハッシュ化
    const passwordHash = await hashPassword(password);

    // ユーザー作成
    const user = await createUser(email, name, passwordHash);
    if (!user) {
      return NextResponse.json(
        { error: "ユーザーの作成に失敗しました" },
        { status: 500 },
      );
    }

    // セッション作成
    await createSession(user);

    return NextResponse.json(
      {
        message: "アカウントが作成されました",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 },
    );
  }
};
