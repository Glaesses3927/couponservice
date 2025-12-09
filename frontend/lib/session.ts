import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/constants";
import type { User } from "./auth";

export interface Session {
  userId: string;
  email: string;
  name: string;
  expiresAt: number;
}

/**
 * セッションを作成してCookieに保存
 */
export const createSession = async (user: User): Promise<void> => {
  const session: Session = {
    userId: user.id,
    email: user.email,
    name: user.name,
    expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
  };

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
    // TODO: 意味理解
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
};

/**
 * 現在のセッションを取得
 */
export const getSession = async (): Promise<Session | null> => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie) {
    return null;
  }

  try {
    const session: Session = JSON.parse(sessionCookie.value);

    if (session.expiresAt < Date.now()) {
      await deleteSession();
      return null;
    }

    return session;
  } catch (error) {
    console.error("Error parsing session:", error);
    return null;
  }
};

/**
 * セッションを削除（ログアウト）
 */
export const deleteSession = async (): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
};

/**
 * 認証が必要なページで使用するヘルパー関数
 */
export const requireAuth = async (): Promise<Session> => {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
};
