-- This script sets up the database schema for the application.

-- Drop tables if they exist to ensure a clean setup
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

-- Create the roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create the users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    first_name VARCHAR(60) NOT NULL, -- Part of full name validation (20-60 chars total)
    last_name VARCHAR(60) NOT NULL,  -- Part of full name validation (20-60 chars total)
    address VARCHAR(400) NOT NULL,   -- Max 400 characters as per requirements
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint to ensure full name length is between 20-60 characters
    CONSTRAINT check_full_name_length CHECK (
        CHAR_LENGTH(TRIM(first_name || ' ' || last_name)) >= 20 AND 
        CHAR_LENGTH(TRIM(first_name || ' ' || last_name)) <= 60
    ),
    
    -- Constraint to ensure address length
    CONSTRAINT check_address_length CHECK (
        CHAR_LENGTH(TRIM(address)) <= 400 AND 
        CHAR_LENGTH(TRIM(address)) > 0
    )
);

-- Create the stores table
CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    address VARCHAR(400) NOT NULL, -- Max 400 characters as per requirements
    owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    average_rating NUMERIC(3, 2) DEFAULT 0.00,
    total_ratings INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint to ensure address length
    CONSTRAINT check_store_address_length CHECK (
        CHAR_LENGTH(TRIM(address)) <= 400 AND 
        CHAR_LENGTH(TRIM(address)) > 0
    )
);

-- Create the ratings table
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, store_id)
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
('system_admin', 'System Administrator with full access'),
('normal_user', 'Normal user who can rate stores'),
('store_owner', 'User who owns a store');

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_stores_owner_id ON stores(owner_id);
CREATE INDEX idx_ratings_user_store ON ratings(user_id, store_id);

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


