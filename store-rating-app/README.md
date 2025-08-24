# 🏪 StoreRater - Store Rating Platform

A modern, full-featured store rating platform built with React and Node.js. Rate stores, discover new places, and help others make informed shopping decisions.


## ✨ Features

### 🎯 Core Features
- **Store Rating System** - Rate stores from 1-5 stars with detailed reviews
- **User Authentication** - Secure login/registration with role-based access
- **Real-time Search** - Find stores quickly with intelligent search
- **Responsive Design** - Beautiful UI that works on all devices
- **Role Management** - Support for Users, Store Owners, and Administrators

### 👥 User Roles

#### 🛍️ Regular Users
- Rate and review stores (1-5 stars)
- Search and discover new stores
- View detailed store information and ratings
- Manage personal ratings and reviews

#### 🏪 Store Owners
- Access detailed store analytics and insights
- Monitor customer feedback and ratings
- Track performance metrics over time
- View and respond to customer reviews

#### 🛡️ System Administrators
- Manage all users and permissions
- View comprehensive system statistics
- Add and manage store listings
- Monitor platform health and activity

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git

3. **Set up environment variables**
   ```bash
   # Copy environment files
   cp .env.development .env.local
   
   # Update the API URL in .env.local
   REACT_APP_API_URL=http://localhost:3001
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Project Structure

```
store-rating-app/
├── public/                 # Public assets
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── FormInput.js   # Custom form input component
│   │   ├── Navbar.js      # Navigation component
│   │   ├── StarRating.js  # Star rating component
│   │   └── ...
│   ├── context/           # React context providers
│   │   └── AuthContext.js # Authentication context
│   ├── pages/             # Page components
│   │   ├── Home.js        # Landing page
│   │   ├── Login.js       # Login page
│   │   ├── Register.js    # Registration page
│   │   ├── Dashboard.js   # User dashboard
│   │   └── ...
│   ├── services/          # API services
│   │   └── api.js         # API client
│   ├── utils/             # Utility functions
│   │   └── validation.js  # Form validation
│   └── App.js             # Main app component
├── .env.development       # Development environment
├── .env.production        # Production environment
└── package.json
```


## 🔧 Configuration

### Environment Variables

#### Development (`.env.development`)
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENVIRONMENT=development
REACT_APP_ENABLE_DEBUG_MODE=true
```

#### Production (`.env.production`)
```env
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_ENVIRONMENT=production
REACT_APP_ENABLE_DEBUG_MODE=false
GENERATE_SOURCEMAP=false
```

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop** (1200px+) - Full layout with sidebar navigation
- **Tablet** (768px-1199px) - Adapted layout with collapsible elements
- **Mobile** (320px-767px) - Mobile-first design with touch-friendly interactions



#### Server Deployment
```bash
# Install serve globally
npm install -g serve

# Serve the production build
serve -s build -l 3000
```

## 🛠️ Development
### Scripts
```bash
npm start          # Start development server
npm run build      # Create production build
npm test           # Run tests
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint issues
npm run analyze    # Analyze bundle size
```


  </p>
</div>
