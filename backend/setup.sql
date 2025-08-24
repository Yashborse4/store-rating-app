-- This script sets up the database schema for the application.

-- Drop tables if they exist to ensure a clean setup
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS users;

-- Create the users table (stores all user information for all roles)
CREATE TABLE users (
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
);




-- Create the stores table (simplified to store only store-specific information)
CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    store_name VARCHAR(100) NOT NULL,
    store_id VARCHAR(50) UNIQUE NOT NULL, -- Custom store identifier
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
);

-- Create the ratings table (properly tracks who gave rating, what rating, when)
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_comment TEXT,
    rating_given_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one rating per user per store
    UNIQUE (user_id, store_id)
);

-- Note: Roles are now stored directly in the users table as VARCHAR
-- No need for separate roles table insertion

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_stores_owner_user_id ON stores(owner_user_id);
CREATE INDEX idx_stores_store_id ON stores(store_id);
CREATE INDEX idx_ratings_user_id ON ratings(user_id);
CREATE INDEX idx_ratings_store_id ON ratings(store_id);
CREATE INDEX idx_ratings_user_store ON ratings(user_id, store_id);
CREATE INDEX idx_ratings_given_at ON ratings(rating_given_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update the updated_at column
CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_stores
BEFORE UPDATE ON stores
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_ratings
BEFORE UPDATE ON ratings
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Function to automatically update store ratings when a new rating is added
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

-- Trigger to update store rating stats when rating is inserted or updated
CREATE TRIGGER update_store_stats_on_rating_insert
AFTER INSERT ON ratings
FOR EACH ROW
EXECUTE FUNCTION update_store_rating_stats();

CREATE TRIGGER update_store_stats_on_rating_update
AFTER UPDATE ON ratings
FOR EACH ROW
EXECUTE FUNCTION update_store_rating_stats();

-- Trigger to update store rating stats when rating is deleted
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

CREATE TRIGGER update_store_stats_on_rating_delete
AFTER DELETE ON ratings
FOR EACH ROW
EXECUTE FUNCTION update_store_rating_stats_on_delete();


