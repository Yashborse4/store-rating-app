import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiStar, 
  FiUser, 
  FiLogOut, 
  FiMenu, 
  FiX,
  FiHome,
  FiGrid
} from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar glass-card">
      <div className="container">
        <div className="navbar-content">
          {/* Logo */}
          <Link to="/" className="navbar-logo" onClick={closeMenu}>
            <FiStar className="logo-icon" />
            <span>StoreRater</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="navbar-nav desktop-nav">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              <FiHome />
              Home
            </Link>
            
            {user && (() => {
              const getDashboardUrl = () => {
                switch (user.role) {
                  case 'system_admin':
                    return '/admin';
                  case 'store_owner':
                    return '/store-dashboard';
                  case 'normal_user':
                  default:
                    return '/dashboard';
                }
              };
              const dashboardUrl = getDashboardUrl();
              return (
                <Link 
                  to={dashboardUrl} 
                  className={`nav-link ${isActive(dashboardUrl) ? 'active' : ''}`}
                >
                  <FiGrid />
                  Dashboard
                </Link>
              );
            })()}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="navbar-actions desktop-nav">
            {user ? (
              <div className="user-menu">
                <div className="user-info">
                  <FiUser className="user-icon" />
                  <span className="user-name">{user.name}</span>
                  {user.role === 'admin' && (
                    <span className="user-badge">Admin</span>
                  )}
                </div>
                <button onClick={handleLogout} className="btn btn-secondary">
                  <FiLogOut />
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-secondary">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}>
          <div className="mobile-nav-content">
            <Link 
              to="/" 
              className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <FiHome />
              Home
            </Link>
            
            {user && (() => {
              const getDashboardUrl = () => {
                switch (user.role) {
                  case 'system_admin':
                    return '/admin';
                  case 'store_owner':
                    return '/store-dashboard';
                  case 'normal_user':
                  default:
                    return '/dashboard';
                }
              };
              const dashboardUrl = getDashboardUrl();
              return (
                <Link 
                  to={dashboardUrl} 
                  className={`mobile-nav-link ${isActive(dashboardUrl) ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <FiGrid />
                  Dashboard
                </Link>
              );
            })()}

            <div className="mobile-divider"></div>

            {user ? (
              <div className="mobile-user-section">
                <div className="mobile-user-info">
                  <FiUser className="user-icon" />
                  <div>
                    <span className="user-name">{user.name}</span>
                    {user.role === 'admin' && (
                      <span className="user-badge">Admin</span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="mobile-nav-link logout-link"
                >
                  <FiLogOut />
                  Logout
                </button>
              </div>
            ) : (
              <div className="mobile-auth-section">
                <Link 
                  to="/login" 
                  className="mobile-nav-link"
                  onClick={closeMenu}
                >
                  <FiUser />
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="mobile-nav-link primary"
                  onClick={closeMenu}
                >
                  <FiStar />
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="mobile-overlay" 
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}
    </nav>
  );
};

export default Navbar;
