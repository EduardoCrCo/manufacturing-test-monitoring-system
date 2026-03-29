import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getUserProfile, logoutUser } from "../services/authService";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userData = await getUserProfile();
      setUser(userData.user);
    } catch (error) {
      console.error("Error loading user profile:", error);
      // If profile fetch fails, token might be invalid
      handleLogout();
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      // Remove token and navigate to login regardless of API response
      localStorage.removeItem("token");
      navigate("/");
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  if (isLoading) {
    return (
      <nav className="navbar">
        <div className="navbar__container">
          <Link to="/dashboard" className="navbar__brand">
            <span className="navbar__brand-icon">🏭</span>
            Manufacturing System
          </Link>
          <div>Loading...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar__container">
        {/* Brand */}
        <Link to="/dashboard" className="navbar__brand">
          <span className="navbar__brand-icon">🏭</span>
          Manufacturing System
        </Link>

        {/* Navigation */}
        <div className="navbar__nav">
          <ul className="navbar__nav-links">
            <li>
              <Link
                to="/dashboard"
                className={`navbar__nav-link ${
                  isActiveLink("/dashboard") ? "navbar__nav-link--active" : ""
                }`}
              >
                📊 Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/test-entry"
                className={`navbar__nav-link ${
                  isActiveLink("/test-entry") ? "navbar__nav-link--active" : ""
                }`}
              >
                ✏️ Test Entry
              </Link>
            </li>
          </ul>

          {/* User Section */}
          <div className="navbar__user">
            {user && (
              <>
                <div className="navbar__user-info">
                  <p className="navbar__user-name">{user.username}</p>
                  <p className="navbar__user-role">{user.role}</p>
                </div>
                <div className="navbar__user-avatar">
                  {getInitials(user.username)}
                </div>
              </>
            )}
            <button onClick={handleLogout} className="navbar__logout">
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
