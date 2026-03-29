import React from "react";
import { useToast } from "../context/ToastContext";
import Toast from "./Toast";

const ToastContainer = () => {
  const { toasts } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="toast-container"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
