const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Initialize database tables with new improved schema
const initializeDatabase = async () => {
  try {
    // Create users table (stores all user information for all roles)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        address VARCHAR(400) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'normal_user',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        
        -- Constraint to ensure valid role
        CONSTRAINT check_valid_role CHECK (
            role IN ('system_admin', 'normal_user', 'store_owner')
        ),
        
        -- Constraint to ensure name length is reasonable
        CONSTRAINT check_name_length CHECK (
            CHAR_LENGTH(TRIM(name)) >= 2 AND 
            CHAR_LENGTH(TRIM(name)) <= 100
        ),
        
        -- Constraint to ensure address length
        CONSTRAINT check_address_length CHECK (
            CHAR_LENGTH(TRIM(address)) <= 400 AND 
            CHAR_LENGTH(TRIM(address)) > 0
        )
      )
    `);

    // Create stores table (simplified to store only store-specific information)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id SERIAL PRIMARY KEY,
        store_name VARCHAR(100) NOT NULL,
        store_id VARCHAR(50) UNIQUE NOT NULL,
        owner_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        store_description TEXT,
        average_rating NUMERIC(3, 2) DEFAULT 0.00,
        total_ratings INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        
        -- Constraint to ensure store name length
        CONSTRAINT check_store_name_length CHECK (
            CHAR_LENGTH(TRIM(store_name)) >= 2 AND 
            CHAR_LENGTH(TRIM(store_name)) <= 100
        ),
        
        -- Constraint to ensure store_id format
        CONSTRAINT check_store_id_format CHECK (
            CHAR_LENGTH(TRIM(store_id)) >= 3 AND 
            CHAR_LENGTH(TRIM(store_id)) <= 50
        )
      )
    `);

    // Create ratings table (properly tracks who gave rating, what rating, when)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review_comment TEXT,
        rating_given_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        
        -- Ensure one rating per user per store
        UNIQUE (user_id, store_id)
      )
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_stores_owner_user_id ON stores(owner_user_id);
      CREATE INDEX IF NOT EXISTS idx_stores_store_id ON stores(store_id);
      CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);
      CREATE INDEX IF NOT EXISTS idx_ratings_store_id ON ratings(store_id);
      CREATE INDEX IF NOT EXISTS idx_ratings_user_store ON ratings(user_id, store_id);
      CREATE INDEX IF NOT EXISTS idx_ratings_given_at ON ratings(rating_given_at);
    `);

    // Create timestamp update function
    await pool.query(`
      CREATE OR REPLACE FUNCTION trigger_set_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create triggers for automatic timestamp updates
    await pool.query(`
      DROP TRIGGER IF EXISTS set_timestamp_users ON users;
      CREATE TRIGGER set_timestamp_users
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();
      
      DROP TRIGGER IF EXISTS set_timestamp_stores ON stores;
      CREATE TRIGGER set_timestamp_stores
      BEFORE UPDATE ON stores
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();
      
      DROP TRIGGER IF EXISTS set_timestamp_ratings ON ratings;
      CREATE TRIGGER set_timestamp_ratings
      BEFORE UPDATE ON ratings
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();
    `);

    // Create function to automatically update store rating statistics
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_store_rating_stats()
      RETURNS TRIGGER AS $$
      BEGIN
          -- Update average rating and total ratings for the store
          UPDATE stores SET 
              average_rating = (
                  SELECT ROUND(AVG(rating::NUMERIC), 2)
                  FROM ratings 
                  WHERE store_id = NEW.store_id
              ),
              total_ratings = (
                  SELECT COUNT(*)
                  FROM ratings 
                  WHERE store_id = NEW.store_id
              )
          WHERE id = NEW.store_id;
          
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create triggers for automatic store rating updates
    await pool.query(`
      DROP TRIGGER IF EXISTS update_store_stats_on_rating_insert ON ratings;
      CREATE TRIGGER update_store_stats_on_rating_insert
      AFTER INSERT ON ratings
      FOR EACH ROW
      EXECUTE FUNCTION update_store_rating_stats();
      
      DROP TRIGGER IF EXISTS update_store_stats_on_rating_update ON ratings;
      CREATE TRIGGER update_store_stats_on_rating_update
      AFTER UPDATE ON ratings
      FOR EACH ROW
      EXECUTE FUNCTION update_store_rating_stats();
    `);

    // Create function and trigger for rating deletion
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_store_rating_stats_on_delete()
      RETURNS TRIGGER AS $$
      BEGIN
          -- Update average rating and total ratings for the store
          UPDATE stores SET 
              average_rating = COALESCE((
                  SELECT ROUND(AVG(rating::NUMERIC), 2)
                  FROM ratings 
                  WHERE store_id = OLD.store_id
              ), 0.00),
              total_ratings = (
                  SELECT COUNT(*)
                  FROM ratings 
                  WHERE store_id = OLD.store_id
              )
          WHERE id = OLD.store_id;
          
          RETURN OLD;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_store_stats_on_rating_delete ON ratings;
      CREATE TRIGGER update_store_stats_on_rating_delete
      AFTER DELETE ON ratings
      FOR EACH ROW
      EXECUTE FUNCTION update_store_rating_stats_on_delete();
    `);

    console.log('Database initialized successfully with improved schema');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

module.exports = {
  pool,
  initializeDatabase
};
