import React from 'react';
import { FaExclamationCircle } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
          <div className="card border-0 shadow-lg rounded-4 p-5" style={{ maxWidth: '500px' }}>
            <div className="text-center mb-4">
              <FaExclamationCircle size={60} className="text-danger mb-3 d-block" />
              <h2 className="fw-bold text-dark">Oops! Something went wrong</h2>
            </div>

            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <strong>Error:</strong> {this.state.error?.message || 'Unknown error occurred'}
            </div>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <div className="mb-4">
                <details className="small text-muted" style={{ whiteSpace: 'pre-wrap' }}>
                  <summary className="mb-2 cursor-pointer fw-bold">Details (Dev Only)</summary>
                  {this.state.errorInfo.componentStack}
                </details>
              </div>
            )}

            <div className="d-grid gap-2">
              <button 
                onClick={this.handleReset}
                className="btn btn-primary rounded-pill"
              >
                Try Again
              </button>
              <a 
                href="/"
                className="btn btn-outline-secondary rounded-pill"
              >
                Go to Home
              </a>
            </div>

            <p className="text-muted text-center small mt-4 mb-0">
              If the problem persists, please refresh the page or contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
