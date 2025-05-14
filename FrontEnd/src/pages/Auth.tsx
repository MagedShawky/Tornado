
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthState } from "@/hooks/useAuthState";
import { LoadingSpinner } from "@/components/auth/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { session, loading, authError } = useAuthState();
  const [authUIError, setAuthUIError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Reset counter and block flag when entering auth page
    sessionStorage.setItem('pageReloadCount', '0');
    sessionStorage.removeItem('blockAutoReload');
    
    // Clear any existing sessions when arriving at auth page
    const clearPreviousSession = async () => {
      if (authError) {
        console.log("Auth error detected, clearing previous session data");
        try {
          // Try to sign out to clear any problematic session data
          await supabase.auth.signOut();
        } catch (error) {
          console.error("Error clearing session:", error);
        }
      }
    };
    
    clearPreviousSession();
  }, [authError]);

  useEffect(() => {
    // Listen for auth errors
    const handleErrors = (event: MessageEvent) => {
      if (
        event.data?.type === 'supabase_error' && 
        event.data?.error
      ) {
        console.error('Auth error:', event.data.error);
        setAuthUIError(event.data.error.message || 'Authentication error occurred');
      }
    };

    window.addEventListener('message', handleErrors);
    return () => {
      window.removeEventListener('message', handleErrors);
    };
  }, []);
  
  useEffect(() => {
    if (session) {
      console.log("Session detected, redirecting to home");
      setRedirecting(true);
      
      // Short delay to ensure state stabilizes before redirect
      const redirectTimeout = setTimeout(() => {
        navigate("/");
      }, 300);
      
      return () => clearTimeout(redirectTimeout);
    }
  }, [session, navigate]);

  const handleRefresh = () => {
    setRetryCount(retryCount + 1);
    setAuthUIError(null);
  };

  if (loading || redirecting) {
    return (
      <LoadingSpinner 
        message={redirecting ? "Redirecting to application..." : "Loading authentication..."}  
      />
    );
  }

  return (
    <div className="container mx-auto max-w-md py-12">
      <div className="bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome to Boat Management</h1>
        
        {(authError || authUIError) && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              {authError || authUIError}
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center" 
                  onClick={handleRefresh}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Authentication
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <SupabaseAuth 
          key={`auth-ui-${retryCount}`} // Force re-render on refresh
          supabaseClient={supabase} 
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#2563eb',
                  brandAccent: '#1d4ed8',
                }
              }
            }
          }}
          providers={[]}
          redirectTo={window.location.origin}
        />
      </div>
    </div>
  );
};

export default Auth;
