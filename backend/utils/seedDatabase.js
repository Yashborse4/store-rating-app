const { initializeDatabase } = require('../config/database');
require('dotenv').config();

/**
 * Initialize database for production
 * This script only sets up the database schema and roles
 * No demo or sample data is created
 */
const initializeProductionDatabase = async () => {
  try {
    console.log('🚀 Initializing production database...');
    
    // Initialize database schema and roles
    await initializeDatabase();
    
    console.log('\n✅ Production database initialized successfully!');
    console.log('\n📋 Database Setup Complete:');
    console.log('=' .repeat(50));
    console.log('✓ Database tables created');
    console.log('✓ Indexes created for performance');
    console.log('✓ User roles configured:');
    console.log('  - system_admin: Full system access');
    console.log('  - normal_user: Basic user access');
    console.log('  - store_owner: Store management access');
    console.log('\n📝 Next Steps:');
    console.log('- Users can now register through the application');
    console.log('- First admin user should be created via registration');
    console.log('- Store data can be added through admin panel');
    console.log('=' .repeat(50));
    
  } catch (error) {
    console.error('❌ Error initializing production database:', error);
    throw error;
  }
};

// Run initialization if called directly
if (require.main === module) {
  initializeProductionDatabase()
    .then(() => {
      console.log('\n✅ Database initialization completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Database initialization failed:', error);
      process.exit(1);
    });
}

module.exports = initializeProductionDatabase;
