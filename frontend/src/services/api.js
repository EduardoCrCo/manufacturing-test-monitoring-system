import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api", // Environment-aware API URL
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    // Add authorization token to headers if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject({
      type: "REQUEST_ERROR",
      message: "Failed to make request",
      originalError: error,
    });
  },
);

// Response interceptor for centralized error handling
API.interceptors.response.use(
  (response) => {
    // Success response - just return the data
    return response;
  },
  (error) => {
    console.error("API Error:", error);

    // Create a standardized error object
    const standardError = {
      type: "API_ERROR",
      message: "An error occurred",
      status: null,
      code: null,
      details: null,
      originalError: error,
    };

    if (error.code === "NETWORK_ERROR" || error.code === "ERR_NETWORK") {
      standardError.type = "NETWORK_ERROR";
      standardError.message =
        "Network connection failed. Please check your internet connection.";
      standardError.code = "NETWORK_ERROR";
    } else if (
      error.code === "ECONNABORTED" ||
      error.message.includes("timeout")
    ) {
      standardError.type = "TIMEOUT_ERROR";
      standardError.message =
        "Request timed out. The server is taking too long to respond.";
      standardError.code = "TIMEOUT";
    } else if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      standardError.status = status;

      switch (status) {
        case 400:
          standardError.message =
            data?.message || "Invalid request. Please check your input.";
          standardError.details = data?.errors || null;
          break;
        case 401:
          standardError.type = "AUTH_ERROR";
          standardError.message =
            "Your session has expired. Please log in again.";
          // Clear token and redirect to login
          localStorage.removeItem("token");
          if (
            window.location.pathname !== "/" &&
            window.location.pathname !== "/login"
          ) {
            setTimeout(() => {
              window.location.href = "/";
            }, 1000);
          }
          break;
        case 403:
          standardError.message =
            "You do not have permission to perform this action.";
          break;
        case 404:
          standardError.message = "The requested resource was not found.";
          break;
        case 422:
          standardError.message = "Validation failed. Please check your input.";
          standardError.details = data?.errors || null;
          break;
        case 429:
          standardError.message =
            "Too many requests. Please wait a moment before trying again.";
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          standardError.message = "Server error. Please try again later.";
          break;
        default:
          standardError.message =
            data?.message || `Request failed with status ${status}`;
      }
    } else if (error.request) {
      // Request made but no response received
      standardError.type = "NETWORK_ERROR";
      standardError.message =
        "No response from server. Please check your connection.";
    }

    return Promise.reject(standardError);
  },
);

export default API;
