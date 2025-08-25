import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import UniversalLogin from './pages/UniversalLogin';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import StoreDetails from './pages/StoreDetails';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App">
            <main className="main-content">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/universal-login" element={<UniversalLogin />} />
                <Route path="/register" element={<Register />} />
                <Route path="/signup" element={<Signup />} />
                
                {/* Protected routes - System Admin */}
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute requiredRole="system_admin">
                      <ErrorBoundary>
                        <AdminDashboard />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin-dashboard" 
                  element={
                    <ProtectedRoute requiredRole="system_admin">
                      <ErrorBoundary>
                        <AdminDashboard />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Protected routes - Normal User */}
                <Route 
                  path="/user-dashboard" 
                  element={
                    <ProtectedRoute requiredRole="normal_user">
                      <ErrorBoundary>
                        <Dashboard />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute requiredRole="normal_user">
                      <ErrorBoundary>
                        <Dashboard />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Protected routes - Store Owner */}
                <Route 
                  path="/store-dashboard" 
                  element={
                    <ProtectedRoute requiredRole="store_owner">
                      <ErrorBoundary>
                        <Dashboard />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Protected routes - Any authenticated user */}
                <Route 
                  path="/store/:id" 
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <StoreDetails />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Catch all route - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
