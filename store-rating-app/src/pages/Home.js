import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './Home.css';

const Home = () => {
  const { user } = useAuth();

  // Get the appropriate dashboard URL based on user role
  const getDashboardUrl = () => {
    if (!user) return '/dashboard';
    
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

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f8f9fa' }}>
        {/* Main Content */}
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', paddingTop: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#333' }}>
          Welcome to Store Rating System
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '40px' }}>
          Rate and review stores to help others make better shopping decisions.
        </p>

        {user ? (
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '30px', 
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            marginBottom: '40px'
          }}>
            <h3 style={{ color: '#333', marginBottom: '20px' }}>Your Account</h3>
            <p style={{ marginBottom: '10px' }}><strong>Role:</strong> {user.role}</p>
            <p style={{ marginBottom: '20px' }}><strong>Email:</strong> {user.email}</p>
            <Link 
              to={getDashboardUrl()}
              style={{ 
                display: 'inline-block',
                padding: '12px 24px', 
                backgroundColor: '#007bff', 
                color: 'white', 
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '1.1rem'
              }}
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '30px', 
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            marginBottom: '40px'
          }}>
            <h3 style={{ color: '#333', marginBottom: '20px' }}>Get Started</h3>
            <p style={{ marginBottom: '20px' }}>Please login or register to start rating stores.</p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <Link 
                to="/login"
                style={{ 
                  display: 'inline-block',
                  padding: '12px 24px', 
                  backgroundColor: '#007bff', 
                  color: 'white', 
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontSize: '1.1rem'
                }}
              >
                Login
              </Link>
              <Link 
                to="/register"
                style={{ 
                  display: 'inline-block',
                  padding: '12px 24px', 
                  backgroundColor: '#28a745', 
                  color: 'white', 
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontSize: '1.1rem'
                }}
              >
                Register
              </Link>
            </div>
          </div>
        )}

        {/* Demo Accounts */}
        <div style={{ 
          backgroundColor: '#fff3cd', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #ffeaa7',
          marginBottom: '40px'
        }}>
          <h4 style={{ color: '#856404', marginBottom: '15px' }}>Demo Accounts</h4>
          <div style={{ textAlign: 'left', display: 'inline-block' }}>
            <p style={{ margin: '5px 0', color: '#856404' }}><strong>Admin:</strong> admin@storerating.com / Admin123!</p>
            <p style={{ margin: '5px 0', color: '#856404' }}><strong>User:</strong> user@storerating.com / User123!</p>
            <p style={{ margin: '5px 0', color: '#856404' }}><strong>Store Owner:</strong> storeowner@storerating.com / Store123!</p>
          </div>
        </div>

        {/* System Features */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px',
          marginTop: '40px'
        }}>
          <div style={{ 
            backgroundColor: '#fff', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <h4 style={{ color: '#333', marginBottom: '10px' }}>System Admin</h4>
            <ul style={{ textAlign: 'left', color: '#666' }}>
              <li>Manage all users</li>
              <li>View system statistics</li>
              <li>Add/edit stores</li>
              <li>User role management</li>
            </ul>
          </div>
          <div style={{ 
            backgroundColor: '#fff', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <h4 style={{ color: '#333', marginBottom: '10px' }}>Normal User</h4>
            <ul style={{ textAlign: 'left', color: '#666' }}>
              <li>Rate stores (1-5 stars)</li>
              <li>Search stores</li>
              <li>View store ratings</li>
              <li>Manage your ratings</li>
            </ul>
          </div>
          <div style={{ 
            backgroundColor: '#fff', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <h4 style={{ color: '#333', marginBottom: '10px' }}>Store Owner</h4>
            <ul style={{ textAlign: 'left', color: '#666' }}>
              <li>View store analytics</li>
              <li>See customer ratings</li>
              <li>Monitor store performance</li>
              <li>View rating statistics</li>
            </ul>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default Home;
