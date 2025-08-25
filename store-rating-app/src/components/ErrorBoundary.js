import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRetry = () => {
    // Reset the error state to retry rendering
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom error UI
      return (
        <div className="error-boundary">
          <div className="container">
            <div className="error-card glass-card">
              <div className="error-header">
                <h1>⚠️ Something went wrong</h1>
                <p>We're sorry, but something unexpected happened.</p>
              </div>
              
              <div className="error-details">
                <h3>What happened?</h3>
                <p>
                  The application encountered an error while rendering this component. 
                  This could be due to a network issue, data formatting problem, or a temporary glitch.
                </p>
                
                <h3>What can you do?</h3>
                <ul>
                  <li>Try refreshing the page</li>
                  <li>Check your internet connection</li>
                  <li>Contact support if the problem persists</li>
                </ul>
              </div>
              
              <div className="error-actions">
                <button 
                  onClick={this.handleRetry}
                  className="btn btn-primary"
                >
                  Try Again
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="btn btn-secondary"
                >
                  Refresh Page
                </button>
              </div>
              
              {process.env.NODE_ENV === 'development' && (
                <details className="error-technical-details">
                  <summary>Technical Details (Development Only)</summary>
                  <div className="error-stack">
                    <h4>Error:</h4>
                    <pre>{this.state.error && this.state.error.toString()}</pre>
                    
                    <h4>Stack Trace:</h4>
                    <pre>{this.state.errorInfo.componentStack}</pre>
                  </div>
                </details>
              )}
            </div>
          </div>
          
          <style jsx>{`
            .error-boundary {
              min-height: 100vh;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }
            
            .error-card {
              max-width: 600px;
              width: 100%;
              padding: 40px;
              text-align: center;
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              border-radius: 20px;
              border: 1px solid rgba(255, 255, 255, 0.2);
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            }
            
            .error-header h1 {
              color: #fff;
              margin-bottom: 10px;
              font-size: 2.5rem;
            }
            
            .error-header p {
              color: rgba(255, 255, 255, 0.8);
              font-size: 1.2rem;
              margin-bottom: 30px;
            }
            
            .error-details {
              text-align: left;
              margin: 30px 0;
              color: rgba(255, 255, 255, 0.9);
            }
            
            .error-details h3 {
              color: #fff;
              margin-bottom: 10px;
            }
            
            .error-details ul {
              margin-left: 20px;
            }
            
            .error-details li {
              margin-bottom: 5px;
            }
            
            .error-actions {
              margin-top: 30px;
            }
            
            .error-actions .btn {
              margin: 0 10px;
              padding: 12px 24px;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
              text-decoration: none;
              display: inline-block;
              transition: all 0.3s ease;
            }
            
            .error-actions .btn-primary {
              background: #4CAF50;
              color: white;
            }
            
            .error-actions .btn-primary:hover {
              background: #45a049;
            }
            
            .error-actions .btn-secondary {
              background: rgba(255, 255, 255, 0.2);
              color: white;
              border: 1px solid rgba(255, 255, 255, 0.3);
            }
            
            .error-actions .btn-secondary:hover {
              background: rgba(255, 255, 255, 0.3);
            }
            
            .error-technical-details {
              margin-top: 30px;
              text-align: left;
            }
            
            .error-technical-details summary {
              color: rgba(255, 255, 255, 0.8);
              cursor: pointer;
              padding: 10px 0;
            }
            
            .error-stack {
              background: rgba(0, 0, 0, 0.3);
              padding: 20px;
              border-radius: 8px;
              margin-top: 10px;
            }
            
            .error-stack h4 {
              color: #fff;
              margin-bottom: 10px;
            }
            
            .error-stack pre {
              color: #ff6b6b;
              white-space: pre-wrap;
              word-break: break-word;
              font-size: 0.9rem;
              line-height: 1.4;
            }
          `}</style>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
