import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null, redirectTo = '/login' }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="loading-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Not authenticated - redirect to login with return URL
  if (!user) {
    return <Navigate 
      to={redirectTo} 
      state={{ from: location.pathname }} 
      replace 
    />;
  }

  // Check if user has required role
  if (requiredRole && user.role !== requiredRole) {
    // Redirect based on user's actual role
    const roleRedirects = {
      'system_admin': '/admin',
      'normal_user': '/dashboard',
      'store_owner': '/store-dashboard'
    };
    
    const userRedirect = roleRedirects[user.role] || '/';
    return <Navigate to={userRedirect} replace />;
  }

  // User is authenticated and has correct role
  return children;
};

export default ProtectedRoute;
