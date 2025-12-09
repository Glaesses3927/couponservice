"use client";

import { ChevronDown, TicketCheck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { isExpired, updateCoupon } from "@/lib/coupon";
import type { Coupon, CouponStatus } from "@/lib/types/coupon";
import CouponCard from "./CouponCard";
import Toast, { type ToastType } from "./Toast";
import UseCouponModal from "./UseCouponModal";

interface CouponListProps {
  initialCoupons: Coupon[];
}

const CouponList = ({ initialCoupons }: CouponListProps) => {
  const [filter, setFilter] = useState<CouponStatus | "all">("all");
  const [showFilter, setShowFilter] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
    isVisible: boolean;
  }>({
    message: "",
    type: "info",
    isVisible: false,
  });

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type, isVisible: true });
  };

  const handleUseCoupon = async (couponId: string) => {
    try {
      // 事前に期限切れ/状態を確認
      const target = coupons.find((c) => c.id === couponId);
      console.log("target:", target?.expiryDate);
      if (!target) {
        showToast("クーポンが見つかりません", "error");
        return;
      }
      if (target.status === "used") {
        showToast("このクーポンはすでに使用済みです", "error");
        return;
      }
      if (isExpired(target.expiryDate)) {
        showToast("有効期限切れのため使用できません", "error");
        return;
      }

      const now = new Date().toISOString();
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === couponId
            ? {
                ...c,
                status: "used" as CouponStatus,
                usedDate: now,
              }
            : c,
        ),
      );

      const updatedCoupon = await updateCoupon(couponId, {
        status: "used",
        usedDate: now,
      });

      if (!updatedCoupon) {
        throw new Error("クーポンの更新に失敗しました");
      }

      showToast("クーポンを使用済みにしました", "success");
    } catch (error) {
      setCoupons(initialCoupons);
      showToast(
        "クーポンの更新に失敗しました。もう一度お試しください。",
        "error",
      );
      console.error("Failed to use coupon:", error);
    }
  };

  const filteredCoupons =
    filter === "all"
      ? coupons
      : coupons.filter((coupon) => coupon.status === filter);

  const availableCount = coupons.filter((c) => c.status === "available").length;
  const usedCount = coupons.filter((c) => c.status === "used").length;
  const totalCount = coupons.length;

  const filterOptions = [
    { value: "all", label: "すべて", count: totalCount },
    { value: "available", label: "利用可能", count: availableCount },
    { value: "used", label: "使用済み", count: usedCount },
  ];

  const currentFilter = filterOptions.find((f) => f.value === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <TicketCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">クーポン</h1>
              <p className="text-xs text-gray-500">
                {availableCount}枚利用可能
              </p>
            </div>
          </div>

          {/* フィルタードロップダウン */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 active:bg-gray-200 transition-colors"
            >
              <span>{currentFilter?.label}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showFilter ? "rotate-180" : ""}`}
              />
            </button>

            {/* ドロップダウンメニュー */}
            <AnimatePresence>
              {showFilter && (
                <>
                  {/** biome-ignore lint/a11y/useKeyWithClickEvents: Backdrop overlay for modal dismiss */}
                  {/** biome-ignore lint/a11y/noStaticElementInteractions: Backdrop overlay for modal dismiss */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowFilter(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-20"
                  >
                    {filterOptions.map((option) => (
                      <button
                        type="button"
                        key={option.value}
                        onClick={() => {
                          setFilter(option.value as CouponStatus | "all");
                          setShowFilter(false);
                        }}
                        className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                          filter === option.value
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-700 active:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option.label}</span>
                          <span
                            className={`text-xs ${
                              filter === option.value
                                ? "text-blue-600"
                                : "text-gray-400"
                            }`}
                          >
                            {option.count}
                          </span>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="p-4">
        {/* サマリーカード */}
        <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {totalCount}
              </div>
              <div className="text-xs text-gray-500 mt-1">総数</div>
            </div>
            <div className="text-center border-x border-gray-200">
              <div className="text-2xl font-bold text-blue-600">
                {availableCount}
              </div>
              <div className="text-xs text-gray-500 mt-1">利用可能</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">
                {usedCount}
              </div>
              <div className="text-xs text-gray-500 mt-1">使用済み</div>
            </div>
          </div>
        </div>

        {/* クーポンリスト */}
        {filteredCoupons.length > 0 ? (
          <div className="space-y-3">
            {filteredCoupons.map((coupon) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                onClick={() => {
                  if (coupon.status === "available") {
                    setSelectedCoupon(coupon);
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <TicketCheck className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">該当するクーポンがありません</p>
          </div>
        )}
      </main>

      {/* クーポン使用モーダル */}
      {selectedCoupon && (
        <UseCouponModal
          coupon={selectedCoupon}
          isOpen={!!selectedCoupon}
          onClose={() => setSelectedCoupon(null)}
          onConfirm={handleUseCoupon}
        />
      )}

      {/* トースト通知 */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
};

export default CouponList;
