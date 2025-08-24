#!/usr/bin/env node

/**
 * Environment Variables Validation Script
 * 
 * This script validates that all required environment variables are set
 * before starting the application in production.
 * 
 * Usage: npm run validate:env
 * or: node scripts/validate-env.js
 */

require('dotenv').config();

console.log('🔍 Environment Variables Validation');
console.log('====================================');

// Define required environment variables for different environments
const requiredVars = {
  development: [
    'PORT',
    'NODE_ENV',
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'JWT_SECRET'
  ],
  production: [
    'PORT',
    'NODE_ENV',
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'JWT_SECRET',
    'ALLOWED_ORIGINS',
    'RATE_LIMIT_WINDOW_MS',
    'RATE_LIMIT_MAX_REQUESTS',
    'BCRYPT_ROUNDS'
  ]
};

// Optional variables with warnings
const optionalVars = [
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASSWORD',
  'EMAIL_FROM',
  'LOG_LEVEL',
  'LOG_TO_FILE',
  'HEALTH_CHECK_SECRET'
];

const currentEnv = process.env.NODE_ENV || 'development';
const varsToCheck = requiredVars[currentEnv] || requiredVars.development;

console.log(`Environment: ${currentEnv}`);
console.log(`Checking ${varsToCheck.length} required variables...\n`);

let errors = [];
let warnings = [];

// Check required variables
varsToCheck.forEach(varName => {
  const value = process.env[varName];
  
  if (!value || value.trim() === '') {
    errors.push(`❌ ${varName} is required but not set`);
  } else {
    // Mask sensitive values for display
    const displayValue = ['JWT_SECRET', 'DB_PASSWORD', 'EMAIL_PASSWORD'].includes(varName) 
      ? `${'*'.repeat(Math.min(value.length, 8))}...`
      : value;
    
    console.log(`✅ ${varName}: ${displayValue}`);
    
    // Additional validation for specific variables
    if (varName === 'JWT_SECRET' && value.length < 32) {
      warnings.push(`⚠️  ${varName} should be at least 32 characters long for security`);
    }
    
    if (varName === 'PORT' && (isNaN(value) || parseInt(value) < 1 || parseInt(value) > 65535)) {
      errors.push(`❌ ${varName} must be a valid port number (1-65535)`);
    }
    
    if (varName === 'BCRYPT_ROUNDS' && (isNaN(value) || parseInt(value) < 10 || parseInt(value) > 15)) {
      warnings.push(`⚠️  ${varName} should be between 10-15 for optimal security/performance balance`);
    }
  }
});

console.log('\n📋 Optional Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  
  if (value && value.trim() !== '') {
    const displayValue = ['EMAIL_PASSWORD', 'HEALTH_CHECK_SECRET'].includes(varName) 
      ? `${'*'.repeat(Math.min(value.length, 8))}...`
      : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`⏸️  ${varName}: not set`);
  }
});

// Show warnings
if (warnings.length > 0) {
  console.log('\n⚠️  Warnings:');
  warnings.forEach(warning => console.log(`  ${warning}`));
}

// Show errors and exit if any
if (errors.length > 0) {
  console.log('\n❌ Errors found:');
  errors.forEach(error => console.log(`  ${error}`));
  
  console.log('\n💡 Tips:');
  console.log('  - Copy .env.production to .env and update with your values');
  console.log('  - Generate a secure JWT secret: openssl rand -base64 64');
  console.log('  - Make sure PostgreSQL database exists and is accessible');
  
  process.exit(1);
}

console.log('\n🎉 All environment variables are properly configured!');

// Additional checks for production
if (currentEnv === 'production') {
  console.log('\n🔒 Production Security Checklist:');
  console.log('  ✅ Environment variables validated');
  
  // Check JWT secret strength
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret && jwtSecret.length >= 64) {
    console.log('  ✅ JWT secret is sufficiently strong');
  } else {
    console.log('  ⚠️  Consider using a longer JWT secret for production');
  }
  
  // Check if using HTTPS origins
  const origins = process.env.ALLOWED_ORIGINS;
  if (origins && origins.includes('https://')) {
    console.log('  ✅ HTTPS origins configured');
  } else {
    console.log('  ⚠️  Consider using HTTPS origins for production');
  }
  
  console.log('  📝 Additional production setup needed:');
  console.log('    - Configure reverse proxy (nginx/apache)');
  console.log('    - Set up SSL certificates');
  console.log('    - Configure database backups');
  console.log('    - Set up monitoring and logging');
}

console.log('\n✨ Ready to start the application!');
