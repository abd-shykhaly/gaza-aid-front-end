import { useEffect, useState } from "react";

export interface ToastProps {
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type,
  duration = 4000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Enter animation
    const enterTimer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    // Auto-dismiss
    const dismissTimer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(onClose, 300);
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(dismissTimer);
    };
  }, [duration, onClose]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(onClose, 300);
  };

  const getToastStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-gradient-to-r from-green-50 to-green-100",
          border: "border-green-200",
          text: "text-green-800",
          icon: "text-green-600",
          iconBg: "bg-green-500",
        };
      case "error":
        return {
          bg: "bg-gradient-to-r from-red-50 to-red-100",
          border: "border-red-200",
          text: "text-red-800",
          icon: "text-red-600",
          iconBg: "bg-red-500",
        };
      case "warning":
        return {
          bg: "bg-gradient-to-r from-amber-50 to-amber-100",
          border: "border-amber-200",
          text: "text-amber-800",
          icon: "text-amber-600",
          iconBg: "bg-amber-500",
        };
      case "info":
        return {
          bg: "bg-gradient-to-r from-blue-50 to-blue-100",
          border: "border-blue-200",
          text: "text-blue-800",
          icon: "text-blue-600",
          iconBg: "bg-blue-500",
        };
      default:
        return {
          bg: "bg-gradient-to-r from-gray-50 to-gray-100",
          border: "border-gray-200",
          text: "text-gray-800",
          icon: "text-gray-600",
          iconBg: "bg-gray-500",
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "error":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "warning":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "info":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  const styles = getToastStyles();

  return (
    <div
      className={`
        relative flex items-center gap-3 min-w-[320px] max-w-[400px]
        px-4 py-3 rounded-xl shadow-xl border backdrop-blur-sm
        transition-all duration-300 ease-out
        ${styles.bg} ${styles.border} ${styles.text}
        ${
          isVisible && !isLeaving
            ? "translate-x-0 opacity-100 scale-100"
            : "translate-x-full opacity-0 scale-95"
        }
      `}
    >
      {/* Icon */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full ${styles.iconBg} bg-opacity-10 flex items-center justify-center ${styles.icon}`}
      >
        {getIcon()}
      </div>

      {/* Message */}
      <div className="flex-1 font-medium text-sm leading-tight">{message}</div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className={`flex-shrink-0 w-6 h-6 rounded-full ${styles.icon} ${styles.iconBg} bg-opacity-10 hover:bg-opacity-20 flex items-center justify-center transition-colors`}
        aria-label="إغلاق"
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-1 ${styles.iconBg} bg-opacity-30 rounded-b-xl transition-all ease-linear`}
        style={{
          width: "100%",
          animation: `shrink ${duration}ms linear`,
        }}
      />
    </div>
  );
};

export default Toast;
