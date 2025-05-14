
import { Component, ErrorInfo, ReactNode } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Check if this is potentially an auth error
    const isAuthError = error.message.toLowerCase().includes('auth') || 
                        error.message.toLowerCase().includes('session') || 
                        error.message.toLowerCase().includes('token') ||
                        error.message.toLowerCase().includes('login') ||
                        error.message.toLowerCase().includes('permission');
    
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    console.log('Is authentication-related error:', isAuthError);
    
    this.setState({ errorInfo });
    
    // For auth errors, we might want to clear the session
    if (isAuthError) {
      console.log('Attempting to recover from auth error...');
      setTimeout(() => {
        // Don't immediately sign out - give user a chance to see the error
      }, 0);
    }
  }

  handleRefresh = () => {
    // Reset error state
    this.setState({ hasError: false, error: undefined });
    
    // For serious errors, full page refresh is more reliable
    if (this.state.error?.message.includes('auth') || this.state.error?.message.includes('session')) {
      window.location.reload();
    } else {
      // For less severe errors, just reset component state
      this.setState({ hasError: false });
    }
  };
  
  handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error signing out:', error);
      // Force navigation to auth page if signOut fails
      window.location.href = '/auth';
    }
  };

  render() {
    if (this.state.hasError) {
      // Check if it seems auth-related
      const isAuthError = this.state.error?.message.toLowerCase().includes('auth') || 
                          this.state.error?.message.toLowerCase().includes('session') ||
                          this.state.error?.message.toLowerCase().includes('token');
      
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            {isAuthError ? 'Authentication Error' : 'Something went wrong'}
          </h2>
          <p className="mb-4 text-gray-700">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={this.handleRefresh}
            >
              Try Again
            </button>
            {isAuthError && (
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                onClick={this.handleSignOut}
              >
                Sign Out and Log In Again
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
