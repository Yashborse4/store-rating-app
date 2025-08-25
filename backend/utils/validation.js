/**
 * Comprehensive validation utilities for the application
 */

/**
 * Validate name (first name or last name)
 * Must be between 20 and 60 characters
 */
const validateName = (name, fieldName = 'Name') => {
  const errors = [];
  
  if (!name || typeof name !== 'string') {
    errors.push(`${fieldName} is required`);
    return { isValid: false, errors };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < 20) {
    errors.push(`${fieldName} must be at least 20 characters long`);
  }
  
  if (trimmedName.length > 60) {
    errors.push(`${fieldName} must not exceed 60 characters`);
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(trimmedName)) {
    errors.push(`${fieldName} can only contain letters, spaces, hyphens, and apostrophes`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    value: trimmedName
  };
};

/**
 * Validate address
 * Must not exceed 400 characters
 */
const validateAddress = (address) => {
  const errors = [];
  
  if (!address || typeof address !== 'string') {
    errors.push('Address is required');
    return { isValid: false, errors };
  }
  
  const trimmedAddress = address.trim();
  
  if (trimmedAddress.length === 0) {
    errors.push('Address cannot be empty');
  }
  
  if (trimmedAddress.length > 400) {
    errors.push('Address must not exceed 400 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    value: trimmedAddress
  };
};

/**
 * Validate password
 * Must be at least 6 characters (simplified for better user experience)
 */
const validatePassword = (password) => {
  const errors = [];
  
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return { isValid: false, errors };
  }
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (password.length > 50) {
    errors.push('Password must not exceed 50 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    value: password
  };
};

/**
 * Validate email format
 */
const validateEmail = (email) => {
  const errors = [];
  
  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
    return { isValid: false, errors };
  }
  
  const trimmedEmail = email.trim().toLowerCase();
  
  // Standard email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    errors.push('Please enter a valid email address');
  }
  
  // Additional checks for email length
  if (trimmedEmail.length > 100) {
    errors.push('Email must not exceed 100 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    value: trimmedEmail
  };
};

/**
 * Validate username
 * Must be between 3 and 50 characters, alphanumeric and underscores only
 */
const validateUsername = (username) => {
  const errors = [];
  
  if (!username || typeof username !== 'string') {
    errors.push('Username is required');
    return { isValid: false, errors };
  }
  
  const trimmedUsername = username.trim().toLowerCase();
  
  if (trimmedUsername.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  
  if (trimmedUsername.length > 50) {
    errors.push('Username must not exceed 50 characters');
  }
  
  // Only alphanumeric characters and underscores
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(trimmedUsername)) {
    errors.push('Username can only contain letters, numbers, and underscores');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    value: trimmedUsername
  };
};

/**
 * Validate store name
 * Must be between 3 and 60 characters
 */
const validateStoreName = (name) => {
  const errors = [];
  
  if (!name || typeof name !== 'string') {
    errors.push('Store name is required');
    return { isValid: false, errors };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < 3) {
    errors.push('Store name must be at least 3 characters long');
  }
  
  if (trimmedName.length > 60) {
    errors.push('Store name must not exceed 60 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    value: trimmedName
  };
};

/**
 * Validate rating
 * Must be integer between 1 and 5
 */
const validateRating = (rating) => {
  const errors = [];
  
  if (rating === undefined || rating === null) {
    errors.push('Rating is required');
    return { isValid: false, errors };
  }
  
  const numRating = parseInt(rating, 10);
  
  if (isNaN(numRating)) {
    errors.push('Rating must be a number');
  } else if (numRating < 1 || numRating > 5) {
    errors.push('Rating must be between 1 and 5');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    value: numRating
  };
};

/**
 * Validate full name (combines first and last name)
 * Must be between 20 and 60 characters total
 */
const validateFullName = (first_name, last_name) => {
  const errors = [];
  
  if (!first_name || typeof first_name !== 'string') {
    errors.push('First name is required');
    return { isValid: false, errors };
  }
  
  if (!last_name || typeof last_name !== 'string') {
    errors.push('Last name is required');
    return { isValid: false, errors };
  }
  
  const trimmedFirstName = first_name.trim();
  const trimmedLastName = last_name.trim();
  const fullName = `${trimmedFirstName} ${trimmedLastName}`;
  
  if (fullName.length < 20) {
    errors.push('Full name must be at least 20 characters long');
  }
  
  if (fullName.length > 60) {
    errors.push('Full name must not exceed 60 characters');
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(fullName)) {
    errors.push('Name can only contain letters, spaces, hyphens, and apostrophes');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    fullName: fullName,
    first_name: trimmedFirstName,
    last_name: trimmedLastName
  };
};

/**
 * Validate user registration data
 */
const validateUserRegistration = (userData) => {
  const { username, email, password, first_name, last_name, address, role_name } = userData;
  const errors = [];
  const validatedData = {};
  
  // Validate username
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.isValid) {
    errors.push(...usernameValidation.errors);
  } else {
    validatedData.username = usernameValidation.value;
  }
  
  // Validate email
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.push(...emailValidation.errors);
  } else {
    validatedData.email = emailValidation.value;
  }
  
  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors);
  } else {
    validatedData.password = passwordValidation.value;
  }
  
  // Validate full name (first + last name must be 20-60 characters)
  const fullNameValidation = validateFullName(first_name, last_name);
  if (!fullNameValidation.isValid) {
    errors.push(...fullNameValidation.errors);
  } else {
    validatedData.first_name = fullNameValidation.first_name;
    validatedData.last_name = fullNameValidation.last_name;
  }
  
  // Validate address
  const addressValidation = validateAddress(address);
  if (!addressValidation.isValid) {
    errors.push(...addressValidation.errors);
  } else {
    validatedData.address = addressValidation.value;
  }
  
  // Validate role_name
  if (!role_name || typeof role_name !== 'string') {
    errors.push('Role is required');
  } else {
    validatedData.role_name = role_name.trim().toLowerCase();
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    data: validatedData
  };
};

/**
 * Validate store creation/update data
 */
const validateStoreData = (storeData) => {
  const { name, email, address } = storeData;
  const errors = [];
  const validatedData = {};
  
  // Validate store name
  const nameValidation = validateStoreName(name);
  if (!nameValidation.isValid) {
    errors.push(...nameValidation.errors);
  } else {
    validatedData.name = nameValidation.value;
  }
  
  // Validate email
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.push(...emailValidation.errors);
  } else {
    validatedData.email = emailValidation.value;
  }
  
  // Validate address
  const addressValidation = validateAddress(address);
  if (!addressValidation.isValid) {
    errors.push(...addressValidation.errors);
  } else {
    validatedData.address = addressValidation.value;
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    data: validatedData
  };
};

/**
 * Simple user registration validation for frontend compatibility
 * Accepts name, email, password format
 */
const validateSimpleUserRegistration = (userData) => {
  const { name, email, password, address } = userData;
  const errors = [];
  const validatedData = {};
  
  // Validate email
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.push(...emailValidation.errors);
  } else {
    validatedData.email = emailValidation.value;
  }
  
  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors);
  } else {
    validatedData.password = passwordValidation.value;
  }
  
  // Validate full name (updated for better user experience - 2-60 characters)
  if (!name || typeof name !== 'string') {
    errors.push('Name is required');
  } else {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      errors.push('Name must be at least 2 characters long');
    } else if (trimmedName.length > 60) {
      errors.push('Name must not exceed 60 characters');
    } else {
      // Check for valid characters
      const nameRegex = /^[a-zA-Z\s'-]+$/;
      if (!nameRegex.test(trimmedName)) {
        errors.push('Name can only contain letters, spaces, hyphens, and apostrophes');
      } else {
        validatedData.name = trimmedName;
      }
    }
  }
  
  // Validate address if provided
  if (address) {
    const addressValidation = validateAddress(address);
    if (!addressValidation.isValid) {
      errors.push(...addressValidation.errors);
    } else {
      validatedData.address = addressValidation.value;
    }
  } else {
    validatedData.address = ''; // Default empty address
  }
  
  // Set default role
  validatedData.role = 'normal_user';
  
  return {
    isValid: errors.length === 0,
    errors,
    data: validatedData
  };
};

module.exports = {
  validateName,
  validateFullName,
  validateAddress,
  validatePassword,
  validateEmail,
  validateUsername,
  validateStoreName,
  validateRating,
  validateUserRegistration,
  validateSimpleUserRegistration,
  validateStoreData
};
