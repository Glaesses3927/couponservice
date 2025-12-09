"use client";

import {
  Calendar,
  CheckCircle2,
  Clock,
  Gift,
  HandHeart,
  PartyPopper,
  Sparkles,
  Ticket,
  UtensilsCrossed,
} from "lucide-react";
import { motion } from "motion/react";
import type { Coupon, CouponCategory } from "../../lib/types/coupon";

interface CouponCardProps {
  coupon: Coupon;
  onClick?: () => void;
}

const categoryConfig: Record<
  CouponCategory,
  { color: string; icon: React.ReactNode; bgColor: string; textColor: string }
> = {
  food: {
    color: "bg-orange-500",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    icon: <UtensilsCrossed className="w-5 h-5" />,
  },
  favor: {
    color: "bg-purple-500",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    icon: <HandHeart className="w-5 h-5" />,
  },
  gift: {
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    icon: <Gift className="w-5 h-5" />,
  },
  activity: {
    color: "bg-green-500",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    icon: <PartyPopper className="w-5 h-5" />,
  },
  special: {
    color: "bg-amber-500",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    icon: <Sparkles className="w-5 h-5" />,
  },
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const CouponCard = ({ coupon, onClick }: CouponCardProps) => {
  const config = categoryConfig[coupon.category];
  const isUsed = coupon.status === "used";
  const isExpired = coupon.status === "expired";
  const isAvailable = coupon.status === "available";

  // TODO: adjust animation
  return (
    <motion.div
      layout // TODO: what is this
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }} // TODO: why does this work
      whileTap={isAvailable ? { scale: 0.98 } : {}}
      onClick={isAvailable ? onClick : undefined}
      className={`relative overflow-hidden rounded-xl border transition-all duration-200 bg-white ${isUsed ? "opacity-60" : ""} ${isExpired ? "opacity-40" : ""} ${isAvailable ? "border-gray-200 active:border-blue-400 cursor-pointer" : "border-gray-200 cursor-not-allowed"}`}
    >
      {/* TODO: opacity does not work */}
      {/* コンテンツ */}
      <div className="p-4 space-y-3">
        {/* ヘッダー */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${config.color} text-white`}
            >
              {config.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {coupon.title}
              </h3>
              {coupon.value && (
                <p className="text-xs text-gray-500 mt-0.5">{coupon.value}</p>
              )}
            </div>
          </div>

          {/* ステータスバッジ */}
          {isUsed && (
            <div className="flex-shrink-0 flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md">
              <CheckCircle2 className="w-3.5 h-3.5 text-gray-600" />
              <span className="text-xs font-medium text-gray-600">使用済</span>
            </div>
          )}
          {isExpired && (
            <div className="flex-shrink-0 flex items-center gap-1 px-2 py-1 bg-red-50 rounded-md">
              <Clock className="w-3.5 h-3.5 text-red-600" />
              <span className="text-xs font-medium text-red-600">期限切</span>
            </div>
          )}
          {isAvailable && (
            <div className="flex-shrink-0 flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-medium text-blue-600">利用可</span>
            </div>
          )}
        </div>

        {/* 説明文 */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {coupon.description}
        </p>

        {/* ID表示 */}
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
          <Ticket className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="break-all">No.{coupon.id}</span>
        </div>

        {/* フッター情報 */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          {coupon.expiryDate && isAvailable && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>期限: {formatDate(coupon.expiryDate)}</span>
            </div>
          )}

          {coupon.usedDate && isUsed && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>使用: {formatDate(coupon.usedDate)}</span>
            </div>
          )}

          {!coupon.expiryDate && !coupon.usedDate && (
            <div className="text-xs text-gray-400">-</div>
          )}
        </div>
      </div>

      {/* 利用可能な券のアクセント */}
      {isAvailable && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
      )}
    </motion.div>
  );
};

export default CouponCard;
