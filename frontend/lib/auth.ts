import { Client } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import bcrypt from "bcryptjs";

// Notion クライアントの初期化
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export const NOTION_USERS_DATABASE_ID =
  process.env.NOTION_USERS_DATABASE_ID || "";

// ユーザー型定義
export interface User {
  id: string;
  userId: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
  lastLoginAt?: string;
}
/**
 * Notionのデータをユーザー型に変換
 * @param page PageObjectResponse
 * @returns User | null
 */
const mapNotionToUser = (page: PageObjectResponse): User | null => {
  try {
    const props = page.properties;

    return {
      id: page.id,
      email: props.Email?.type === "email" ? props.Email.email || "" : "",
      name:
        props.Name?.type === "title"
          ? props.Name.title?.[0]?.plain_text || ""
          : "",
      passwordHash:
        props.PasswordHash?.type === "rich_text"
          ? props.PasswordHash.rich_text?.[0]?.plain_text || ""
          : "",
      userId:
        props.UserId?.type === "rich_text"
          ? props.UserId.rich_text?.[0]?.plain_text || page.id
          : page.id,
      createdAt:
        props.CreatedAt?.type === "date"
          ? props.CreatedAt.date?.start || ""
          : "",
      lastLoginAt:
        props.LastLoginAt?.type === "date"
          ? props.LastLoginAt.date?.start || ""
          : "",
    };
  } catch (error) {
    console.error("Error mapping Notion data to User:", error);
    return null;
  }
};

/**
 * Notion の応答が PageObjectResponse かどうかを判定する型ガード
 */

// biome-ignore lint/suspicious/noExplicitAny: false positive
export const isPageObjectResponse = (obj: any): obj is PageObjectResponse => {
  return (
    obj &&
    obj.object === "page" &&
    typeof obj.id === "string" &&
    obj.properties !== undefined
  );
};

/**
 * メールアドレスでユーザーを検索
 * @param email string
 * @returns User | null
 */
export const findUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const response = await notion.dataSources.query({
      data_source_id: NOTION_USERS_DATABASE_ID,
      filter: {
        property: "Email",
        email: {
          equals: email,
        },
      },
    });

    if (response.results.length === 0) {
      return null;
    }

    const first = response.results[0];
    if (!isPageObjectResponse(first)) {
      return null;
    }

    return mapNotionToUser(first);
  } catch (error) {
    console.error("Error finding user by email:", error);
    return null;
  }
};

/**
 * 新しいユーザーを作成
 */
export const createUser = async (
  email: string,
  name: string,
  passwordHash: string,
): Promise<User | null> => {
  try {
    const response = await notion.pages.create({
      parent: { data_source_id: NOTION_USERS_DATABASE_ID },
      properties: {
        Email: {
          email: email,
        },
        Name: {
          title: [
            {
              text: {
                content: name,
              },
            },
          ],
        },
        PasswordHash: {
          rich_text: [
            {
              text: {
                content: passwordHash,
              },
            },
          ],
        },
        CreatedAt: {
          date: {
            start: new Date().toISOString(),
          },
        },
      },
    });

    // 作成されたページIDをUserIdプロパティに設定
    const pageId = response.id;
    await notion.pages.update({
      page_id: pageId,
      properties: {
        UserId: {
          rich_text: [
            {
              text: {
                content: pageId,
              },
            },
          ],
        },
      },
    });

    // 更新後のページを取得
    const updatedPage = await notion.pages.retrieve({ page_id: pageId });
    if (!isPageObjectResponse(updatedPage)) {
      return null;
    }
    return mapNotionToUser(updatedPage);
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
};

/**
 * ユーザーの最終ログイン日時を更新
 */
export const updateLastLogin = async (userId: string): Promise<boolean> => {
  try {
    await notion.pages.update({
      page_id: userId,
      properties: {
        LastLoginAt: {
          date: {
            start: new Date().toISOString(),
          },
        },
      },
    });
    return true;
  } catch (error) {
    console.error("Error updating last login:", error);
    return false;
  }
};

/**
 * bcryptを使用したパスワードハッシュ化
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12; // 計算コスト（10-12が推奨）
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
};

/**
 * パスワード検証
 */
export const verifyPassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};
