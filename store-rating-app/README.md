# 🏪 StoreRater - Store Rating Platform

A modern, full-featured store rating platform built with React and Node.js. Rate stores, discover new places, and help others make informed shopping decisions.

![StoreRater Hero](https://via.placeholder.com/800x400/0a0a0a/ffffff?text=StoreRater+Store+Rating+Platform)

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

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yashborse4/store-rating-app.git
   cd store-rating-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

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

## 🎨 Design System

### Color Palette
- **Primary**: Modern dark theme with glass morphism effects
- **Background**: Rich gradients from deep black to charcoal
- **Glass Cards**: Translucent white overlays with backdrop blur
- **Text**: High contrast white and gray tones for accessibility
- **Accent**: Clean white for buttons and highlights

### Typography
- **Font**: Inter - Modern, readable, and professional
- **Hierarchy**: Clear size and weight distinctions
- **Spacing**: Consistent vertical rhythm throughout

### Components
- **Glass Cards**: Modern cards with backdrop blur and subtle borders
- **Buttons**: Multiple variants with smooth hover animations
- **Forms**: Clean inputs with focus states and validation feedback
- **Navigation**: Responsive navbar with mobile-friendly design

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

## 🚀 Deployment

### Production Build
```bash
# Create optimized production build
npm run build

# The build folder contains the production-ready files
```

### Hosting Options

#### Static Hosting (Recommended)
- **Netlify**: Drag and drop the `build` folder
- **Vercel**: Connect GitHub repo for automatic deployments
- **AWS S3 + CloudFront**: For enterprise deployments

#### Server Deployment
```bash
# Install serve globally
npm install -g serve

# Serve the production build
serve -s build -l 3000
```

### Environment Setup
1. Update `REACT_APP_API_URL` in `.env.production`
2. Configure your backend CORS settings
3. Set up HTTPS certificates
4. Configure monitoring and analytics

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm test -- --watch
```

## 📊 Performance

### Optimizations
- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: Components loaded on demand
- **Asset Optimization**: Images and fonts optimized
- **Caching**: Service worker for offline capability
- **Bundle Analysis**: Use `npm run analyze` to inspect bundle size

### Performance Targets
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- First Input Delay: < 100ms

## 🔒 Security

### Features
- **Authentication**: Secure JWT-based authentication
- **Authorization**: Role-based access control
- **Input Validation**: Client and server-side validation
- **HTTPS**: Production deployment enforces HTTPS
- **Environment Variables**: Sensitive data in environment files

### Best Practices
- No hardcoded credentials or API keys
- Proper error handling without exposing system details
- Input sanitization and validation
- Secure session management

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

### Code Style
- **ESLint**: Configured with React best practices
- **Prettier**: Automatic code formatting
- **Consistent**: Follow established patterns in the codebase

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests** for new functionality
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Development Guidelines
- Write clear, self-documenting code
- Add tests for new features
- Follow the existing code style
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing framework
- **React Icons** - Beautiful icon library
- **Framer Motion** - Smooth animations
- **Design Inspiration** - Modern web design trends

## 📞 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs on [GitHub Issues](https://github.com/yashborse4/store-rating-app/issues)
- **Discussions**: Join conversations in [GitHub Discussions](https://github.com/yashborse4/store-rating-app/discussions)

## 🔄 Version History

### v1.0.0 (Current)
- ✅ Complete authentication system
- ✅ Store rating and review functionality
- ✅ Modern, responsive UI design
- ✅ Role-based access control
- ✅ Production-ready deployment
- ✅ Comprehensive documentation

---

<div align="center">
  <p>Built with ❤️ using React</p>
  <p>
    <a href="#top">Back to top</a>
  </p>
</div>
