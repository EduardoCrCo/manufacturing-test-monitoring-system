import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // In production, you might want to log this to an error reporting service
    if (process.env.NODE_ENV === "production") {
      // logErrorToService(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;

      return (
        <div className="error-boundary">
          <div className="error-boundary__container">
            <div className="error-boundary__icon">⚠️</div>

            <h1 className="error-boundary__title">
              Oops! Something went wrong
            </h1>

            <p className="error-boundary__message">
              We apologize for the inconvenience. An unexpected error occurred
              while loading this page.
            </p>

            <div className="error-boundary__actions">
              <button
                onClick={this.handleRetry}
                className="error-boundary__button error-boundary__button--primary"
              >
                🔄 Try Again
              </button>

              <button
                onClick={this.handleGoHome}
                className="error-boundary__button error-boundary__button--secondary"
              >
                🏠 Go to Dashboard
              </button>
            </div>

            {/* Show error details only in development */}
            {process.env.NODE_ENV === "development" && (
              <details className="error-boundary__details">
                <summary className="error-boundary__details-summary">
                  🔍 Error Details (Development Only)
                </summary>
                <div className="error-boundary__error-info">
                  <h4>Error:</h4>
                  <pre className="error-boundary__error-text">
                    {error && error.toString()}
                  </pre>

                  <h4>Component Stack:</h4>
                  <pre className="error-boundary__stack">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}

            <div className="error-boundary__help">
              <p className="error-boundary__help-text">
                If this problem persists, please:
              </p>
              <ul className="error-boundary__help-list">
                <li>Refresh the page</li>
                <li>Clear your browser cache</li>
                <li>Check your internet connection</li>
                <li>Contact support if the issue continues</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
