# User Management System API

A complete authentication and user management system built with Node.js, Express.js, and PostgreSQL. Features role-based authentication with JWT tokens and automatic redirection based on user roles.

## Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 👥 **Role-Based Access Control** - Three user roles with different permissions
- 🔄 **Role-Based Redirection** - Automatic redirect to appropriate dashboards
- 🛡️ **Password Security** - Bcrypt password hashing
- 📝 **Input Validation** - Comprehensive request validation
- 🗄️ **PostgreSQL Database** - Robust relational database

## User Roles

1. **System Administrator** (`system_admin`)
   - Full system access
   - Can manage all users
   - Can activate/deactivate accounts

2. **Normal User** (`normal_user`)
   - Basic user access
   - Can view own profile
   - Limited system access

3. **Store Owner** (`store_owner`)
   - Store management access
   - Can view normal users and other store owners
   - Business-related permissions

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup PostgreSQL Database**
   - Create a PostgreSQL database named `user_management`
   - Update database credentials in `.env` file

4. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   ```
   
   Update the following variables in `.env`:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=user_management
   DB_USER=your_postgres_username
   DB_PASSWORD=your_postgres_password

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   ```

5. **Initialize Database and Seed Sample Data**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development mode with auto-restart
   npm run dev

   # Production mode
   npm start
   ```

## Sample Users

After running the seed script, you can use these sample accounts:

### System Administrator
- **Email:** `admin@example.com`
- **Password:** `admin123`
- **Redirect URL:** `http://localhost:3001/admin`

### Normal Users
- **Email:** `user1@example.com` | **Password:** `user123`
- **Email:** `user2@example.com` | **Password:** `user123`
- **Redirect URL:** `http://localhost:3001/dashboard`

### Store Owners
- **Email:** `store1@example.com` | **Password:** `store123`
- **Email:** `store2@example.com` | **Password:** `store123`
- **Redirect URL:** `http://localhost:3001/store`

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | User login | Public |
| POST | `/logout` | User logout | Private |
| GET | `/profile` | Get current user profile | Private |
| GET | `/dashboard` | Get role-specific dashboard URL | Private |
| GET | `/roles` | Get available roles | Public |

### User Management Routes (`/api/users`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | Get all users | Admin only |
| GET | `/:userId` | Get user by ID | Own resource or Admin |
| PUT | `/:userId/status` | Update user status | Admin only |
| GET | `/role/:roleName` | Get users by role | Admin or Store Owner |

### System Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | API documentation | Public |
| GET | `/health` | Health check | Public |

## API Usage Examples

### 1. User Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "password123",
    "role_name": "normal_user",
    "first_name": "New",
    "last_name": "User"
  }'
```

### 2. User Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### 3. Get User Profile (with token)
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Get Dashboard URL (with token)
```bash
curl -X GET http://localhost:3000/api/auth/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Response Format

All API responses follow this consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "user": { ... },
    "token": "jwt_token_here",
    "redirectUrl": "http://localhost:3001/dashboard"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

## Authentication Flow

1. **Registration/Login** → Receive JWT token and redirect URL
2. **Store token** → Save JWT token in client-side storage
3. **Make requests** → Include token in Authorization header
4. **Role-based access** → Different endpoints based on user role
5. **Automatic redirection** → Frontend redirects based on role

## Role-Based Redirection

After successful login, users are automatically redirected to their respective dashboards:

- **System Admin** → Admin panel with user management
- **Normal User** → User dashboard with personal features
- **Store Owner** → Store management dashboard

## Security Features

- 🔒 **Password Hashing** - Bcrypt with salt rounds
- 🎫 **JWT Tokens** - Secure token-based authentication
- 🛡️ **Input Validation** - Request data validation
- 🚫 **CORS Protection** - Cross-origin request security
- ⏰ **Token Expiration** - Configurable token lifetime
- 🔐 **Role Authorization** - Endpoint-level access control

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_id INTEGER REFERENCES roles(id),
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Roles Table
```sql
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Error Codes

| Code | Description |
|------|-------------|
| `MISSING_TOKEN` | No authentication token provided |
| `INVALID_TOKEN` | Token is invalid or malformed |
| `TOKEN_EXPIRED` | Authentication token has expired |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| `USER_NOT_FOUND` | User does not exist |
| `INVALID_CREDENTIALS` | Email or password is incorrect |
| `EMAIL_EXISTS` | Email already registered |
| `USERNAME_EXISTS` | Username already taken |

## Development

### Project Structure
```
backend/
├── config/          # Database configuration
├── controllers/     # Request handlers
├── middleware/      # Authentication & authorization
├── models/          # Database models
├── routes/          # API routes
├── utils/           # Utility functions
├── .env             # Environment variables
├── server.js        # Main application file
└── package.json     # Dependencies and scripts
```

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with auto-restart
- `npm run seed` - Seed database with sample users

