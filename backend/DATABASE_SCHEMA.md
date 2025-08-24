# Database Schema Documentation

## Updated Database Structure

The database has been restructured to properly separate concerns and store user roles directly in the users table.

## Tables Structure

### 1. Users Table
**Purpose**: Stores all user information for all user roles (system_admin, normal_user, store_owner)

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,              -- Full name of user
    email VARCHAR(100) UNIQUE NOT NULL,      -- Unique email address
    password_hash VARCHAR(255) NOT NULL,     -- Hashed password
    address VARCHAR(400) NOT NULL,           -- User's address
    role VARCHAR(20) NOT NULL DEFAULT 'normal_user',  -- User role stored directly
    is_active BOOLEAN DEFAULT true,          -- Account status
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

**Roles**: `system_admin`, `normal_user`, `store_owner`

### 2. Stores Table
**Purpose**: Stores only store-specific information

```sql
CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    store_name VARCHAR(100) NOT NULL,        -- Store Name
    store_id VARCHAR(50) UNIQUE NOT NULL,    -- Custom Store ID
    owner_user_id INTEGER NOT NULL,          -- Owner User ID (references users.id)
    store_description TEXT,                  -- Store Description
    average_rating NUMERIC(3, 2) DEFAULT 0.00,  -- Auto-calculated average rating
    total_ratings INTEGER DEFAULT 0,         -- Auto-calculated total ratings count
    is_active BOOLEAN DEFAULT true,          -- Store status
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

**Key Fields as Requested**:
- ✅ Store Name (`store_name`)
- ✅ Store ID (`store_id`)
- ✅ Owner User ID (`owner_user_id`)
- ✅ Store Description (`store_description`)

### 3. Ratings Table
**Purpose**: Properly tracks who gave rating, what rating is given, and when it was given

```sql
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,                -- Who gave the rating
    store_id INTEGER NOT NULL,               -- Which store was rated
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),  -- What rating (1-5)
    review_comment TEXT,                     -- Optional review comment
    rating_given_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,  -- When rating was given
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,       -- When rating was last updated
    UNIQUE (user_id, store_id)               -- One rating per user per store
);
```

**Key Fields as Requested**:
- ✅ Who gave rating (`user_id`)
- ✅ What rating is given (`rating`)
- ✅ When it was given (`rating_given_at`)

## Key Improvements

### 1. Simplified User Management
- **Single users table** stores all user information regardless of role
- **Role stored directly** as VARCHAR instead of separate roles table
- **Cleaner user queries** - no need to join with roles table

### 2. Focused Store Information
- **Only store-specific data** in stores table
- **Owner information** referenced from users table
- **Custom store_id** for business identification
- **Store description** field added as requested

### 3. Enhanced Rating Tracking
- **Clear tracking** of who rated what and when
- **Review comments** supported
- **Automatic rating statistics** updated via database triggers
- **Proper foreign key relationships** with cascade deletes

### 4. Automatic Rating Updates
- **Database triggers** automatically update store ratings when ratings are added/updated/deleted
- **Real-time statistics** - no need for manual calculation
- **Data consistency** maintained at database level

## Database Relationships

```
Users (1) -----> (Many) Stores
  ^                       |
  |                       v
  └── (Many) Ratings (Many) ────┘
```

- One user can own many stores
- One user can give ratings to many stores
- One store can receive ratings from many users
- Each user can only rate each store once

## Indexes for Performance

- `idx_users_email` - Fast user lookup by email
- `idx_users_role` - Fast queries by user role
- `idx_stores_owner_user_id` - Fast lookup of stores by owner
- `idx_stores_store_id` - Fast lookup by custom store ID
- `idx_ratings_user_id` - Fast lookup of user's ratings
- `idx_ratings_store_id` - Fast lookup of store's ratings
- `idx_ratings_user_store` - Fast lookup of specific user-store rating
- `idx_ratings_given_at` - Fast queries by rating date

## Usage Examples

### Create a new user
```sql
INSERT INTO users (name, email, password_hash, address, role) 
VALUES ('John Doe', 'john@example.com', 'hashed_password', '123 Main St', 'store_owner');
```

### Create a new store
```sql
INSERT INTO stores (store_name, store_id, owner_user_id, store_description) 
VALUES ('Best Electronics', 'ELEC001', 1, 'Premium electronics store with latest gadgets');
```

### Add a rating
```sql
INSERT INTO ratings (user_id, store_id, rating, review_comment) 
VALUES (2, 1, 5, 'Excellent service and great products!');
```

### Get store with owner information
```sql
SELECT 
    s.store_name,
    s.store_id,
    s.store_description,
    s.average_rating,
    s.total_ratings,
    u.name as owner_name,
    u.email as owner_email
FROM stores s
JOIN users u ON s.owner_user_id = u.id
WHERE s.is_active = true;
```

### Get user's ratings
```sql
SELECT 
    r.rating,
    r.review_comment,
    r.rating_given_at,
    s.store_name,
    u.name as user_name
FROM ratings r
JOIN stores s ON r.store_id = s.id
JOIN users u ON r.user_id = u.id
WHERE r.user_id = 1
ORDER BY r.rating_given_at DESC;
```

This improved schema provides better data organization, clearer relationships, and automatic maintenance of rating statistics while meeting all your specified requirements.
