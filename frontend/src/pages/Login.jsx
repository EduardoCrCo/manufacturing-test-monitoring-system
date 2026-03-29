import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { useToast } from "../context/ToastContext";

const Login = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");

  // Demo credentials for easy testing
  const demoCredentials = {
    operator: {
      email: "operator1@manufacturing.com",
      password: "Operator123!",
    },
    supervisor: {
      email: "supervisor@manufacturing.com",
      password: "Super123!",
    },
    admin: { email: "admin@manufacturing.com", password: "Admin123!" },
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Clear API error on input change
    if (apiError) {
      setApiError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setApiError("");
    setSuccess("");

    try {
      const data = await loginUser(formData);
      localStorage.setItem("token", data.token);

      showSuccess("Login successful! Redirecting to dashboard...");

      // Small delay to show success message
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Login failed:", error);

      if (error.details && Array.isArray(error.details)) {
        // Handle validation errors from backend
        const backendErrors = {};
        error.details.forEach((err) => {
          if (err.path) {
            backendErrors[err.path] = err.msg;
          }
        });
        setErrors(backendErrors);
        showError("Please correct the errors below.");
      } else {
        showError(
          error.message ||
            "Login failed. Please check your credentials and try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const useDemoCredentials = (role) => {
    const credentials = demoCredentials[role];
    setFormData({
      email: credentials.email,
      password: credentials.password,
    });
    setErrors({});
    setApiError("");
  };

  return (
    <div className="login">
      <div className="login__card">
        <div className="login__header">
          <h1 className="login__title">Welcome Back</h1>
          <p className="login__subtitle">
            Manufacturing Test Monitoring System
          </p>
        </div>

        {success && <div className="login__success">{success}</div>}

        {apiError && <div className="login__error">{apiError}</div>}

        <form className="login__form" onSubmit={handleSubmit}>
          <div className="login__field">
            <label className="login__label">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className={`login__input ${errors.email ? "login__input--error" : ""}`}
              disabled={loading}
            />
            {errors.email && (
              <div className="login__field-error">{errors.email}</div>
            )}
          </div>

          <div className="login__field">
            <label className="login__label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              className={`login__input ${errors.password ? "login__input--error" : ""}`}
              disabled={loading}
            />
            {errors.password && (
              <div className="login__field-error">{errors.password}</div>
            )}
          </div>

          <button
            type="submit"
            className={`login__submit ${loading ? "login__submit--loading" : ""}`}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="login__demo">
          <div className="login__demo-title">🚀 Demo Credentials</div>
          <div className="login__demo-credential">
            <span>Operator:</span>
            <span className="login__demo-value">
              operator1@manufacturing.com
            </span>
            <button
              type="button"
              onClick={() => useDemoCredentials("operator")}
              style={{
                marginLeft: "8px",
                padding: "2px 6px",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Use
            </button>
          </div>
          <div className="login__demo-credential">
            <span>Supervisor:</span>
            <span className="login__demo-value">
              supervisor@manufacturing.com
            </span>
            <button
              type="button"
              onClick={() => useDemoCredentials("supervisor")}
              style={{
                marginLeft: "8px",
                padding: "2px 6px",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Use
            </button>
          </div>
          <div className="login__demo-credential">
            <span>Admin:</span>
            <span className="login__demo-value">admin@manufacturing.com</span>
            <button
              type="button"
              onClick={() => useDemoCredentials("admin")}
              style={{
                marginLeft: "8px",
                padding: "2px 6px",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Use
            </button>
          </div>
          <div className="login__demo-credential">
            <span>Passwords:</span>
            <span className="login__demo-value">See buttons above</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
