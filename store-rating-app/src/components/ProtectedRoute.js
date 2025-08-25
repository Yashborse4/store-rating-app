import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null, allowedRoles = [], redirectTo = '/login' }) => {
  const { user, loading, isInitialized, isAuthenticated, getDashboardRoute } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication or during initialization
  if (loading || !isInitialized) {
    return (
      <div className="loading-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div className="loading-spinner" style={{
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 2s linear infinite'
        }}></div>
        <div>Authenticating...</div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  // Not authenticated - redirect to login with return URL
  if (!isAuthenticated() || !user) {
    return <Navigate 
      to={redirectTo} 
      state={{ from: location.pathname }} 
      replace 
    />;
  }

  // Check role-based access
  const hasAccess = () => {
    // If no specific role requirements, allow any authenticated user
    if (!requiredRole && allowedRoles.length === 0) {
      return true;
    }
    
    // Check specific required role
    if (requiredRole && user.role === requiredRole) {
      return true;
    }
    
    // Check if user role is in allowed roles list
    if (allowedRoles.length > 0 && allowedRoles.includes(user.role)) {
      return true;
    }
    
    return false;
  };

  // User doesn't have required permissions - redirect to their dashboard
  if (!hasAccess()) {
    const userDashboard = getDashboardRoute();
    return <Navigate to={userDashboard} replace />;
  }

  // User is authenticated and has correct permissions
  return children;
};

export default ProtectedRoute;
