#!/usr/bin/env node

/**
 * Production Database Setup Script
 * 
 * This script initializes the production database with proper schema
 * and no demo data. Run this once when setting up a new production environment.
 * 
 * Usage: npm run setup:production
 * or: node scripts/setup-production-db.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Check if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';

console.log('🚀 Production Database Setup');
console.log('================================');
console.log(`Environment: ${process.env.NODE_ENV}`);
console.log(`Database: ${process.env.DB_NAME}`);
console.log(`Host: ${process.env.DB_HOST}`);

// Validate required environment variables
const requiredEnvVars = [
  'DB_HOST',
  'DB_PORT', 
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`  - ${varName}`));
  process.exit(1);
}

// Create database connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

async function setupDatabase() {
  let client;
  
  try {
    console.log('\n📋 Connecting to database...');
    client = await pool.connect();
    console.log('✅ Connected to database');

    // Read and execute the setup SQL
    const setupSqlPath = path.join(__dirname, '..', 'setup.sql');
    if (!fs.existsSync(setupSqlPath)) {
      throw new Error('setup.sql file not found');
    }

    console.log('\n📋 Reading database schema...');
    const setupSQL = fs.readFileSync(setupSqlPath, 'utf8');
    
    console.log('📋 Executing database setup...');
    await client.query(setupSQL);
    console.log('✅ Database schema created successfully');

    // Create initial admin role if needed
    console.log('\n📋 Verifying roles...');
    const roleCheck = await client.query('SELECT COUNT(*) FROM roles');
    const roleCount = parseInt(roleCheck.rows[0].count);
    
    if (roleCount === 0) {
      console.log('📋 Creating default roles...');
      await client.query(`
        INSERT INTO roles (name, description) VALUES 
        ('system_admin', 'System Administrator with full access'),
        ('normal_user', 'Normal user who can rate stores'),
        ('store_owner', 'User who owns a store')
      `);
      console.log('✅ Default roles created');
    } else {
      console.log('✅ Roles already exist');
    }

    // Show database statistics
    console.log('\n📊 Database Statistics:');
    const stats = await Promise.all([
      client.query('SELECT COUNT(*) FROM roles'),
      client.query('SELECT COUNT(*) FROM users'),
      client.query('SELECT COUNT(*) FROM stores'),
      client.query('SELECT COUNT(*) FROM ratings')
    ]);

    console.log(`  - Roles: ${stats[0].rows[0].count}`);
    console.log(`  - Users: ${stats[1].rows[0].count}`);
    console.log(`  - Stores: ${stats[2].rows[0].count}`);
    console.log(`  - Ratings: ${stats[3].rows[0].count}`);

    console.log('\n🎉 Production database setup completed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('  1. Start your application server');
    console.log('  2. Users can register through the application');
    console.log('  3. Create stores through the admin panel');
    console.log('  4. Configure your web server (nginx/apache)');
    
  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Tips:');
      console.error('  - Make sure PostgreSQL is running');
      console.error('  - Verify database connection settings in .env');
      console.error('  - Check if the database exists');
    } else if (error.code === '28P01') {
      console.error('\n💡 Authentication failed:');
      console.error('  - Check DB_USER and DB_PASSWORD in .env');
    } else if (error.code === '3D000') {
      console.error('\n💡 Database does not exist:');
      console.error('  - Create the database first:');
      console.error(`  - CREATE DATABASE ${process.env.DB_NAME};`);
    }
    
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Run setup
setupDatabase();
