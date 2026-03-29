import { useState, useCallback } from "react";
import { useToast } from "../context/ToastContext";

/**
 * Custom hook for managing async operations with loading, error, and success states
 * @param {Object} options - Configuration options
 * @param {boolean} options.showSuccessToast - Whether to show success toast (default: false)
 * @param {boolean} options.showErrorToast - Whether to show error toast (default: true)
 * @param {string} options.successMessage - Custom success message
 * @param {string} options.loadingMessage - Custom loading message
 */
const useAsyncOperation = (options = {}) => {
  const {
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = "Operation completed successfully",
    loadingMessage = "Loading...",
  } = options;

  const { showSuccess, showError } = useToast();

  const [state, setState] = useState({
    isLoading: false,
    error: null,
    data: null,
    isSuccess: false,
  });

  const execute = useCallback(
    async (asyncFunction, ...args) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        isSuccess: false,
      }));

      try {
        const result = await asyncFunction(...args);

        setState((prev) => ({
          ...prev,
          isLoading: false,
          data: result,
          isSuccess: true,
          error: null,
        }));

        if (showSuccessToast) {
          showSuccess(successMessage);
        }

        return result;
      } catch (error) {
        console.error("Async operation failed:", error);

        const errorMessage = getErrorMessage(error);

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
          isSuccess: false,
        }));

        if (showErrorToast) {
          showError(errorMessage);
        }

        throw error; // Re-throw so caller can handle if needed
      }
    },
    [showSuccessToast, showErrorToast, successMessage, showSuccess, showError],
  );

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      data: null,
      isSuccess: false,
    });
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    clearError,
  };
};

/**
 * Extract user-friendly error message from error object
 */
const getErrorMessage = (error) => {
  if (typeof error === "string") {
    return error;
  }

  if (error?.message) {
    return error.message;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (
    error?.response?.data?.errors &&
    Array.isArray(error.response.data.errors)
  ) {
    return error.response.data.errors
      .map((err) => err.msg || err.message)
      .join(", ");
  }

  switch (error?.type) {
    case "NETWORK_ERROR":
      return "Network connection failed. Please check your internet connection.";
    case "TIMEOUT_ERROR":
      return "Request timed out. Please try again.";
    case "AUTH_ERROR":
      return "Authentication failed. Please log in again.";
    case "API_ERROR":
    default:
      return "An unexpected error occurred. Please try again.";
  }
};

export default useAsyncOperation;
