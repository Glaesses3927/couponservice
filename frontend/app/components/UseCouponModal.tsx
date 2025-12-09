"use client";

import { Check, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Coupon } from "@/lib/types/coupon";

interface UseCouponModalProps {
  coupon: Coupon;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (couponId: string) => Promise<void>;
}

const UseCouponModal = ({
  coupon,
  isOpen,
  onClose,
  onConfirm,
}: UseCouponModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(coupon.id);
      onClose();
    } catch (error) {
      console.error("Failed to use coupon:", error);
      // エラーハンドリングは親コンポーネントで行う
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* TODO: exit does not work */}
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">
                      クーポンを使用
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      このクーポンを使用済みにしますか？
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="ml-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    disabled={isSubmitting}
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {coupon.title}
                  </h3>
                  {coupon.description && (
                    <p className="text-sm text-gray-600 mb-3">
                      {coupon.description}
                    </p>
                  )}
                  {coupon.value && (
                    <div className="text-sm text-gray-500">{coupon.value}</div>
                  )}
                  {coupon.expiryDate && (
                    <div className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">有効期限:</span>{" "}
                      {new Date(coupon.expiryDate).toLocaleDateString("ja-JP")}
                    </div>
                  )}
                </div>

                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    ⚠️
                    使用済みにすると、元に戻すことはできません。本当によろしいですか？
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                          }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>処理中...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        <span>使用する</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UseCouponModal;
