import React from "react";
import { Navigate } from "react-router-dom";

// Component to protect routes that require authentication
const PrivateRoute = ({ children }) => {
  // Check if user has valid token in localStorage
  const token = localStorage.getItem("token");

  // If no token exists, redirect to login page
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // If token exists, render the protected component
  return children;
};

export default PrivateRoute;
