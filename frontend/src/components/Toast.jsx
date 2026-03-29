import React, { useEffect, useState } from "react";
import { useToast } from "../context/ToastContext";

const Toast = ({ id, message, type, duration }) => {
  const { removeToast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entry animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => removeToast(id), 300); // Animation duration
  };

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(handleClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, id]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
      default:
        return "ℹ️";
    }
  };

  const getProgressBarColor = () => {
    switch (type) {
      case "success":
        return "#4CAF50";
      case "error":
        return "#F44336";
      case "warning":
        return "#FF9800";
      case "info":
      default:
        return "#2196F3";
    }
  };

  return (
    <div
      className={`toast toast--${type} ${isVisible ? "toast--visible" : ""} ${isLeaving ? "toast--leaving" : ""}`}
      role="alert"
      aria-live="polite"
    >
      <div className="toast__content">
        <div className="toast__icon">{getIcon()}</div>
        <div className="toast__message">{message}</div>
        <button
          className="toast__close"
          onClick={handleClose}
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>

      {/* Progress bar for duration */}
      {duration > 0 && (
        <div
          className="toast__progress"
          style={{
            backgroundColor: getProgressBarColor(),
            animationDuration: `${duration}ms`,
          }}
        />
      )}
    </div>
  );
};

export default Toast;
