"use client";

import { CheckCircle, Info, X, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 3000,
}: ToastProps) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <XCircle className="w-5 h-5 text-red-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
  };

  const backgrounds = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    info: "bg-blue-50 border-blue-200",
  };

  const textColors = {
    success: "text-green-900",
    error: "text-red-900",
    info: "text-blue-900",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
        >
          <div
            className={`${backgrounds[type]} border rounded-lg shadow-lg p-4 flex items-start gap-3`}
          >
            <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
            <p className={`flex-1 text-sm font-medium ${textColors[type]}`}>
              {message}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
            >
              <X className={`w-4 h-4 ${textColors[type]}`} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
