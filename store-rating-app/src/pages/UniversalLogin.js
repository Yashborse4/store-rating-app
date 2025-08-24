import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';
import { validateEmail, validatePassword } from '../utils/validation';
import './UniversalLogin.css';

const UniversalLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        return validateEmail(value);
      case 'password':
        return validatePassword(value);
      default:
        return null;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation
    const error = validateField(name, value);
    setFormErrors(prev => ({ ...prev, [name]: error }));
    setSubmitMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const errors = {
      email: validateField('email', formData.email),
      password: validateField('password', formData.password)
    };
    
    // Remove null errors
    Object.keys(errors).forEach(key => {
      if (!errors[key]) delete errors[key];
    });
    
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      setSubmitMessage('Please fix the errors above');
      return;
    }
    
    setLoading(true);
    try {
      const user = await login(formData.email, formData.password);
      
      // Redirect based on role
      switch (user.role) {
        case 'system_admin':
          navigate('/admin');
          break;
        case 'normal_user':
        case 'store_owner':
          navigate('/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      setSubmitMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };

  return (
    <div className="login-page">
      <div className="container-sm">
        <div className="login-card glass-card">
          <div className="login-header">
            <h1>Login to Your Account</h1>
            <p>Access your dashboard based on your role</p>
          </div>

          {submitMessage && (
            <div className={`message ${submitMessage.includes('Invalid') ? 'error' : 'success'}`}>
              {submitMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <FormInput
              id="email"
              name="email"
              type="email"
              label="Email Address"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleInputChange}
              error={formErrors.email}
              required
            />
            
            <FormInput
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              error={formErrors.password}
              required
              maxLength={16}
            />

            <button 
              type="submit" 
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="login-divider">
            <span>or</span>
          </div>

          <div className="signup-section">
            <p>Don't have an account?</p>
            <button 
              onClick={handleSignupClick}
              className="btn btn-secondary btn-full"
            >
              Create New Account
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UniversalLogin;
