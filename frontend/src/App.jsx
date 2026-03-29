import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./context";
import { ErrorBoundary, ToastContainer } from "./components";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TestEntry from "./pages/TestEntry";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";

// Component to handle root path redirect logic
const RootRedirect = () => {
  const token = localStorage.getItem("token");
  // If user is already logged in, redirect to dashboard
  // If no token, show login page
  return token ? <Navigate to="/dashboard" replace /> : <Login />;
};

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="app">
          <Routes>
            {/* Public route - login page with auto-redirect for logged in users */}
            <Route path="/" element={<RootRedirect />} />

            {/* Protected routes - require authentication */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Layout>
                    <ErrorBoundary>
                      <Dashboard />
                    </ErrorBoundary>
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/test-entry"
              element={
                <PrivateRoute>
                  <Layout>
                    <ErrorBoundary>
                      <TestEntry />
                    </ErrorBoundary>
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* Fallback for unknown routes - redirect to root */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Global Toast Container */}
          <ToastContainer />
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
