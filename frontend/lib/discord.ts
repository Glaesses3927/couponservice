import type { Coupon } from "@/lib/types/coupon";

/**
 * Discord Webhookでクーポン使用通知を送信
 */
export const sendCouponUsedNotification = async (
  coupon: Coupon,
  userName?: string,
): Promise<void> => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn("DISCORD_WEBHOOK_URL is not configured");
    return;
  }

  try {
    const categoryEmoji: Record<string, string> = {
      food: "🍽️",
      favor: "💝",
      gift: "🎁",
      activity: "🎯",
      special: "✨",
    };

    const emoji = categoryEmoji[coupon.category] || "🎫";

    // TODO: いい塩梅に
    // Discord Embed メッセージ
    const embed = {
      title: `${emoji} クーポンが使用されました！`,
      description: `**${coupon.title}**が使用されました。`,
      color: 0x2563eb,
      fields: [
        {
          name: "クーポン名",
          value: coupon.title,
          inline: true,
        },
        {
          name: "カテゴリ",
          value: coupon.category,
          inline: true,
        },
        {
          name: "使用者",
          value: userName || "不明",
          inline: true,
        },
        {
          name: "説明",
          value: coupon.description || "なし",
          inline: false,
        },
        {
          name: "使用日時",
          value: coupon.usedDate
            ? new Date(coupon.usedDate).toLocaleString("ja-JP", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "不明",
          inline: false,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: "CouponService",
      },
    };

    if (coupon.value) {
      embed.fields.push({
        name: "価値",
        value: coupon.value,
        inline: true,
      });
    }

    const payload = {
      username: "クーポン通知Bot",
      avatar_url: "https://cdn.discordapp.com/emojis/1234567890.png", // TODO: お好みのアバターURL
      embeds: [embed],
    };

    // タイムアウト設定付きでfetch（10秒）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Discord API Error: ${response.status} - ${errorText}`);
      }

      console.log("Discord notification sent successfully");
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    console.error("Failed to send Discord notification:", error);
    throw error;
  }
};

/**
 * シンプルなテキスト通知を送信
 */
export const sendSimpleNotification = async (
  message: string,
): Promise<void> => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn("DISCORD_WEBHOOK_URL is not configured");
    return;
  }

  try {
    const payload = {
      content: message,
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Discord API Error: ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to send Discord notification:", error);
  }
};
