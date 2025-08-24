import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';
import { validateName, validateEmail, validatePassword, validateAddress, hasFormErrors } from '../utils/validation';
import './UniversalLogin.css';

const Signup = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return validateName(value);
      case 'email':
        return validateEmail(value);
      case 'password':
        return validatePassword(value);
      case 'address':
        return validateAddress(value);
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
      name: validateField('name', formData.name),
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
      address: validateField('address', formData.address)
    };
    
    // Remove null errors
    Object.keys(errors).forEach(key => {
      if (!errors[key]) delete errors[key];
    });
    
    setFormErrors(errors);
    
    if (hasFormErrors(errors)) {
      setSubmitMessage('Please fix the errors above');
      return;
    }
    
    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (error) {
      setSubmitMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="login-page">
      <div className="container-sm">
        <div className="login-card glass-card">
          <div className="login-header">
            <h1>Create Your Account</h1>
            <p>Sign up as a Normal User to rate and review stores</p>
          </div>

          {submitMessage && (
            <div className={`message ${submitMessage.includes('successfully') || submitMessage.includes('Account created') ? 'success' : 'error'}`}>
              {submitMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <FormInput
              id="name"
              name="name"
              type="text"
              label="Full Name"
              placeholder="Enter your full name (20-60 characters)"
              value={formData.name}
              onChange={handleInputChange}
              error={formErrors.name}
              required
              maxLength={60}
            />
            
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
              placeholder="8-16 characters with uppercase and special character"
              value={formData.password}
              onChange={handleInputChange}
              error={formErrors.password}
              required
              maxLength={16}
            />
            
            <FormInput
              id="address"
              name="address"
              type="textarea"
              label="Address"
              placeholder="Enter your complete address (max 400 characters)"
              value={formData.address}
              onChange={handleInputChange}
              error={formErrors.address}
              required
              maxLength={400}
              rows={3}
            />

            <button 
              type="submit" 
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="login-divider">
            <span>or</span>
          </div>

          <div className="signup-section">
            <p>Already have an account?</p>
            <button 
              onClick={handleLoginClick}
              className="btn btn-secondary btn-full"
            >
              Sign In to Your Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
