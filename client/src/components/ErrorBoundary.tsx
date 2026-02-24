import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          color: "white",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          padding: 20,
          zIndex: 9999,
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Something Went Wrong</h2>
          <p style={{ fontSize: 14, color: "#a0aec0", marginBottom: 24, textAlign: "center", maxWidth: 360 }}>
            The app encountered an unexpected issue. Please try again.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={this.handleRetry}
              style={{
                background: "linear-gradient(135deg, #e94560, #c62a71)",
                color: "white",
                border: "none",
                padding: "12px 28px",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "rgba(255,255,255,0.1)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.2)",
                padding: "12px 28px",
                borderRadius: 10,
                fontSize: 15,
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
