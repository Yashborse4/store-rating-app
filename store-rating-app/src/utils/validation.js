/**
 * Form validation utilities
 */

// Validate full name (20-60 characters total)
export const validateName = (name) => {
  if (!name || typeof name !== 'string') {
    return 'Name is required';
  }
  
  const trimmedName = name.trim();
  if (trimmedName.length < 20) {
    return 'Full name must be at least 20 characters long';
  }
  
  if (trimmedName.length > 60) {
    return 'Full name must not exceed 60 characters';
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(trimmedName)) {
    return 'Name can only contain letters, spaces, hyphens, and apostrophes';
  }
  
  return null;
};

// Validate first and last name combination
export const validateFullName = (firstName, lastName) => {
  if (!firstName || typeof firstName !== 'string') {
    return 'First name is required';
  }
  
  if (!lastName || typeof lastName !== 'string') {
    return 'Last name is required';
  }
  
  const trimmedFirstName = firstName.trim();
  const trimmedLastName = lastName.trim();
  const fullName = `${trimmedFirstName} ${trimmedLastName}`;
  
  if (fullName.length < 20) {
    return 'Full name must be at least 20 characters long';
  }
  
  if (fullName.length > 60) {
    return 'Full name must not exceed 60 characters';
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(fullName)) {
    return 'Name can only contain letters, spaces, hyphens, and apostrophes';
  }
  
  return null;
};

// Validate email format
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return 'Email is required';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  
  return null;
};

// Validate password (8-16 characters, at least one uppercase and one special character)
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return 'Password is required';
  }
  
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  
  if (password.length > 16) {
    return 'Password must not exceed 16 characters';
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  
  // Check for at least one special character
  const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
  if (!specialCharRegex.test(password)) {
    return 'Password must contain at least one special character (!@#$%^&*()_+-=[]{};\':"\\|,.<>?/)';
  }
  
  return null;
};

// Validate address (max 400 characters)
export const validateAddress = (address) => {
  if (!address || typeof address !== 'string') {
    return 'Address is required';
  }
  
  const trimmedAddress = address.trim();
  if (trimmedAddress.length > 400) {
    return 'Address must not exceed 400 characters';
  }
  
  return null;
};

// Validate rating (1-5)
export const validateRating = (rating) => {
  const numRating = Number(rating);
  if (!rating || isNaN(numRating)) {
    return 'Rating is required';
  }
  
  if (numRating < 1 || numRating > 5) {
    return 'Rating must be between 1 and 5';
  }
  
  return null;
};

// Validate all fields for user form
export const validateUserForm = (userData) => {
  const errors = {};
  
  const nameError = validateName(userData.name);
  if (nameError) errors.name = nameError;
  
  const emailError = validateEmail(userData.email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validatePassword(userData.password);
  if (passwordError) errors.password = passwordError;
  
  const addressError = validateAddress(userData.address);
  if (addressError) errors.address = addressError;
  
  return errors;
};

// Check if form has any errors
export const hasFormErrors = (errors) => {
  return Object.keys(errors).length > 0;
};
