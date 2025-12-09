import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NOTION_API_KEY: process.env.NOTION_API_KEY,
    NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID,
    NOTION_USERS_DATABASE_ID: process.env.NOTION_USERS_DATABASE_ID,
    DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL,
    ADMIN_USER_ID: process.env.ADMIN_USER_ID,
  },
};

export default nextConfig;
