
import { Navigate, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { useAuthState } from "@/hooks/useAuthState";
import { useRoleBasedRedirect } from "@/hooks/useRoleBasedRedirect";
import { LoadingSpinner } from "./auth/LoadingSpinner";
import { useEffect, useState } from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { checkAndRefreshSession, proactiveSessionRefresh } from "@/integrations/supabase/client";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { session, loading, userRole, authError } = useAuthState();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshAttempt, setRefreshAttempt] = useState(0);
  const location = useLocation();
  useRoleBasedRedirect(userRole);

  // Add a safety timeout for loading state - increased from 8 to 15 seconds
  useEffect(() => {
    let timeoutId: number;
    
    if (loading) {
      timeoutId = window.setTimeout(() => {
        setLoadingTimeout(true);
      }, 15000); // Show extended loading after 15 seconds (increased from 8)
    }
    
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [loading]);

  // Only attempt auto-refresh once per component mount, not on every render
  useEffect(() => {
    // Check if auto-refresh is blocked due to too many page reloads
    const isAutoReloadBlocked = sessionStorage.getItem('blockAutoReload') === 'true';
    
    if (session && authError && refreshAttempt === 0 && !isAutoReloadBlocked) {
      console.log("Auto-attempting session refresh due to auth error with existing session");
      handleRefresh();
    }
  }, [authError]); // Add authError as dependency to react to new auth errors

  // Manual refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshAttempt(prev => prev + 1);
    
    try {
      console.log("Attempting manual session refresh");
      
      // First try proactive refresh
      let isValid = await proactiveSessionRefresh();
      
      if (!isValid) {
        // If that fails, try the standard refresh
        isValid = await checkAndRefreshSession();
      }
      
      if (!isValid) {
        console.log("Session refresh failed, redirecting to auth");
        // Force a clean sign-out before redirecting
        await supabase.auth.signOut();
        window.location.href = "/auth";
        return;
      }
      
      console.log("Session refresh successful, reloading components without page refresh");
      setIsRefreshing(false);
      // Reset the block on auto reloads since user manually triggered this
      sessionStorage.removeItem('blockAutoReload');
      // Clear reload count since this was manual
      sessionStorage.setItem('pageReloadCount', '0');
    } catch (error) {
      console.error("Error refreshing session:", error);
      try {
        // Force a clean sign-out before redirecting
        await supabase.auth.signOut();
      } catch (e) {
        console.error("Error signing out:", e);
      }
      window.location.href = "/auth";
    } finally {
      setIsRefreshing(false);
    }
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <LoadingSpinner 
        message={loadingTimeout ? "Authentication is taking longer than expected. You can wait or try refreshing the page." : undefined} 
      />
    );
  }

  // Show auth error with refresh button if there's a problem
  if (authError) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-screen">
        <Alert variant="destructive" className="max-w-lg">
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
        <Button 
          className="mt-4"
          onClick={handleRefresh} 
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Session
            </>
          )}
        </Button>
        <Button 
          className="mt-2"
          variant="outline"
          onClick={() => window.location.href = "/auth"} 
          disabled={isRefreshing}
        >
          Go to Sign In
        </Button>
      </div>
    );
  }

  // Redirect to auth if no session found
  if (!session) {
    console.log("No session found, redirecting to auth");
    // Save current location to redirect back after login
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // If all checks pass, render the protected content
  return (
    <>
      <Header />
      <ErrorBoundary 
        fallback={
          <div className="p-8 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">Authentication error</h2>
            <p className="mb-4 text-gray-700">
              There was a problem with your session. Please try signing in again.
            </p>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => {
                window.location.href = "/auth";
              }}
            >
              Go to Sign In
            </button>
          </div>
        }
      >
        {children}
      </ErrorBoundary>
    </>
  );
};
