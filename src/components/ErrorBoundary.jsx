import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red', background: '#1a1a1a', height: '100vh' }}>
          <h1>Something went wrong</h1>
          <pre style={{ color: '#ccc', fontSize: 12 }}>{this.state.error?.message}</pre>
          <pre style={{ color: '#888', fontSize: 10 }}>{this.state.error?.stack}</pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: 20, padding: '10px 20px' }}>
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}