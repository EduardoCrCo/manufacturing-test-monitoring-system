import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const TOAST_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
};

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(
    (message, type = TOAST_TYPES.INFO, duration = 5000) => {
      const id = Date.now() + Math.random();
      const toast = { id, message, type, duration };

      setToasts((prev) => [...prev, toast]);

      // Auto-remove toast after duration
      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, duration);
      }

      return id;
    },
    [],
  );

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Helper methods for different toast types
  const showSuccess = useCallback(
    (message, duration) => addToast(message, TOAST_TYPES.SUCCESS, duration),
    [addToast],
  );

  const showError = useCallback(
    (message, duration = 8000) =>
      addToast(message, TOAST_TYPES.ERROR, duration),
    [addToast],
  );

  const showWarning = useCallback(
    (message, duration) => addToast(message, TOAST_TYPES.WARNING, duration),
    [addToast],
  );

  const showInfo = useCallback(
    (message, duration) => addToast(message, TOAST_TYPES.INFO, duration),
    [addToast],
  );

  const value = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    TOAST_TYPES,
  };

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
};

export default ToastProvider;
