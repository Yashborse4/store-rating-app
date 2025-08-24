import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { 
  FiStar, 
  FiUsers, 
  FiShield, 
  FiTrendingUp,
  FiArrowRight,
  FiAward
} from 'react-icons/fi';
import './Home.css';

const Home = () => {
  const { user } = useAuth();

  // Get the appropriate dashboard URL based on user role
  const getDashboardUrl = () => {
    if (!user) return '/dashboard';
    
    switch (user.role) {
      case 'system_admin':
        return '/admin';
      case 'store_owner':
        return '/store-dashboard';
      case 'normal_user':
      default:
        return '/dashboard';
    }
  };

  const features = [
    {
      icon: <FiStar />,
      title: "Smart Rating System",
      description: "Rate stores with our intuitive 5-star system and help build a trustworthy community."
    },
    {
      icon: <FiUsers />,
      title: "Community Driven",
      description: "Join thousands of users sharing honest reviews and recommendations."
    },
    {
      icon: <FiShield />,
      title: "Verified Reviews",
      description: "All reviews are verified and authenticated to ensure genuine feedback."
    },
    {
      icon: <FiTrendingUp />,
      title: "Real-time Analytics",
      description: "Store owners get detailed insights and analytics on their performance."
    }
  ];

  const userTypes = [
    {
      title: "System Admin",
      features: [
        "Manage all users and permissions",
        "View comprehensive system statistics",
        "Add and manage store listings",
        "Monitor platform health and activity"
      ]
    },
    {
      title: "Regular User",
      features: [
        "Rate and review stores (1-5 stars)",
        "Search and discover new stores",
        "View detailed store information",
        "Manage your personal ratings"
      ]
    },
    {
      title: "Store Owner",
      features: [
        "Access detailed store analytics",
        "Monitor customer feedback",
        "Track performance metrics",
        "Respond to customer reviews"
      ]
    }
  ];

  return (
    <>
      <Navbar />
      <div className="home-page">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container">
            <div className="hero-content fade-in">
              <div className="hero-text">
                <h1 className="hero-title">
                  Discover & Rate
                  <br />Amazing Stores
                </h1>
                <p className="hero-subtitle">
                  Join our community of reviewers and help others make informed shopping decisions. 
                  Share your experiences and discover the best stores around you.
                </p>
                
                {user ? (
                  <div className="hero-user-section glass-card">
                    <div className="user-welcome">
                      <FiAward className="welcome-icon" />
                      <div>
                        <h3>Welcome back, {user.name}!</h3>
                        <p>Role: <span className="user-role">{user.role.replace('_', ' ')}</span></p>
                      </div>
                    </div>
                    <Link to={getDashboardUrl()} className="btn btn-primary btn-large">
                      Go to Dashboard
                      <FiArrowRight />
                    </Link>
                  </div>
                ) : (
                  <div className="hero-actions">
                    <Link to="/register" className="btn btn-primary btn-large">
                      Get Started
                      <FiArrowRight />
                    </Link>
                    <Link to="/login" className="btn btn-secondary btn-large">
                      Sign In
                    </Link>
                  </div>
                )}
              </div>
              
              <div className="hero-stats">
                <div className="stat-item glass-card slide-up">
                  <div className="stat-number">1000+</div>
                  <div className="stat-label">Stores Rated</div>
                </div>
                <div className="stat-item glass-card slide-up">
                  <div className="stat-number">5000+</div>
                  <div className="stat-label">Reviews</div>
                </div>
                <div className="stat-item glass-card slide-up">
                  <div className="stat-number">500+</div>
                  <div className="stat-label">Active Users</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="container">
            <div className="section-header fade-in">
              <h2 className="section-title">Why Choose StoreRater?</h2>
              <p className="section-subtitle">
                Our platform provides everything you need to make informed shopping decisions
                and share your experiences with the community.
              </p>
            </div>
            
            <div className="features-grid grid grid-2">
              {features.map((feature, index) => (
                <div key={index} className="feature-card glass-card slide-up">
                  <div className="feature-icon">
                    {feature.icon}
                  </div>
                  <div className="feature-content">
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* User Types Section */}
        <section className="featured-section">
          <div className="container">
            <div className="section-header fade-in">
              <h2 className="section-title">Built for Everyone</h2>
              <p className="section-subtitle">
                Whether you're a customer, store owner, or administrator,
                our platform has features tailored for your needs.
              </p>
            </div>
            
            <div className="grid grid-3">
              {userTypes.map((type, index) => (
                <div key={index} className="feature-card glass-card fade-in">
                  <div className="feature-content">
                    <h3>{type.title}</h3>
                    <ul className="feature-list">
                      {type.features.map((feature, featureIndex) => (
                        <li key={featureIndex}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {!user && (
          <section className="cta-section">
            <div className="container">
              <div className="cta-card glass-card fade-in">
                <h2 className="cta-title">Ready to Get Started?</h2>
                <p className="cta-description">
                  Join our growing community of reviewers and start sharing
                  your store experiences today.
                </p>
                <div className="cta-actions">
                  <Link to="/register" className="btn btn-primary btn-large">
                    Create Account
                    <FiArrowRight />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default Home;
