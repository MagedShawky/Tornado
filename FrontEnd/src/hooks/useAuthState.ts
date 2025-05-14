
import { useEffect, useRef, useState, useCallback } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase, checkAndRefreshSession, proactiveSessionRefresh } from "@/integrations/supabase/client";

export const useAuthState = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const isMounted = useRef(true);
  const initialLoadAttempted = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const refreshTimerRef = useRef<number | null>(null);
  const refreshAttemptCount = useRef(0);
  const pageReloadCount = useRef(0);

  // Function to reset auth state on error
  const resetAuthState = useCallback(() => {
    if (!isMounted.current) return;
    
    setSession(null);
    setUserRole(null);
    setAuthError("Authentication session expired. Please sign in again.");
  }, []);
  
  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      console.log("Fetching user role for user:", userId);
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user role:", error);
        return;
      }
      
      if (isMounted.current) {
        console.log("Setting user role:", profile?.role);
        setUserRole(profile?.role || null);
      }
    } catch (error) {
      console.error("Exception in fetchUserRole:", error);
      if (isMounted.current) {
        setUserRole(null);
      }
    }
  }, []);

  // Set up refresh check interval
  const setupSessionRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      window.clearInterval(refreshTimerRef.current);
    }
    
    // Check session validity every 5 minutes (less frequent checks)
    refreshTimerRef.current = window.setInterval(async () => {
      console.log("Running scheduled session check");
      try {
        // Try a proactive refresh rather than just a check
        const isValid = await proactiveSessionRefresh();
        if (!isValid && isMounted.current) {
          // If we've tried several times and failed, reset auth
          refreshAttemptCount.current += 1;
          console.log(`Session refresh attempt ${refreshAttemptCount.current} failed`);
          
          if (refreshAttemptCount.current >= 3) {
            resetAuthState();
            window.clearInterval(refreshTimerRef.current!);
            refreshTimerRef.current = null;
          }
        } else {
          // Success - reset counter
          refreshAttemptCount.current = 0;
        }
      } catch (error) {
        console.error("Error in scheduled session check:", error);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }, [resetAuthState]);

  useEffect(() => {
    // Set up safety timeout to prevent infinite loading - increased from 10 to 20 seconds
    timeoutRef.current = window.setTimeout(() => {
      if (loading && isMounted.current) {
        console.log("Auth state loading timeout triggered");
        setLoading(false);
        setAuthError("Authentication timed out. Please try refreshing the page.");
        // Removed toast notification as it was causing disruptive refreshes
      }
    }, 20000); // Increased to 20 seconds maximum loading time

    isMounted.current = true;

    const handleAuthChange = (event: string, currentSession: Session | null) => {
      if (!isMounted.current) return;
      
      console.log("Auth state changed:", event, "User:", currentSession?.user?.email);
      
      // Only handle token refresh events if we've already initialized
      if (event === 'TOKEN_REFRESHED') {
        if (initialLoadAttempted.current) {
          console.log("Token refreshed - updating session");
          setSession(currentSession);
          // Reset auth error if we successfully refreshed
          if (currentSession && authError) {
            setAuthError(null);
          }
          return;
        } else {
          console.log("Token refreshed during initial load - treating as normal auth event");
        }
      }
      
      if (currentSession?.user) {
        setSession(currentSession);
        fetchUserRole(currentSession.user.id);
        setAuthError(null);
        setupSessionRefresh();
      } else {
        setSession(null);
        setUserRole(null);
      }
      
      // Only update loading state if this is an initial load or significant auth event
      if (!initialLoadAttempted.current || ['SIGNED_IN', 'SIGNED_OUT', 'INITIAL_SESSION'].includes(event)) {
        setLoading(false);
        initialLoadAttempted.current = true;
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log("Initializing auth state...");
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting initial session:", error);
          if (isMounted.current) {
            setLoading(false);
            setAuthError("Failed to initialize authentication. Please try refreshing the page.");
            initialLoadAttempted.current = true;
          }
          return;
        }

        if (!isMounted.current) return;

        if (initialSession?.user) {
          console.log("Initial session found for user:", initialSession.user.email);
          setSession(initialSession);
          await fetchUserRole(initialSession.user.id);
          setupSessionRefresh();
        } else {
          console.log("No initial session found");
          setSession(null);
          setUserRole(null);
        }
        
        setLoading(false);
        initialLoadAttempted.current = true;
      } catch (error) {
        console.error("Exception in initializeAuth:", error);
        if (isMounted.current) {
          setLoading(false);
          setAuthError("An error occurred during authentication. Please try refreshing the page.");
          initialLoadAttempted.current = true;
        }
      }
    };

    initializeAuth();

    // Store page load count in session storage to detect loops
    const storedReloadCount = sessionStorage.getItem('pageReloadCount');
    pageReloadCount.current = storedReloadCount ? parseInt(storedReloadCount, 10) : 0;
    
    // Reset counter if it's been a while since the last reload
    const lastReloadTime = sessionStorage.getItem('lastReloadTime');
    const currentTime = Date.now();
    if (lastReloadTime && (currentTime - parseInt(lastReloadTime, 10) > 60000)) {
      console.log("More than 1 minute since last reload, resetting counter");
      pageReloadCount.current = 0;
    }
    
    pageReloadCount.current++;
    sessionStorage.setItem('pageReloadCount', String(pageReloadCount.current));
    sessionStorage.setItem('lastReloadTime', String(currentTime));
    
    // If too many reloads have occurred in quick succession, stop automatic reloading
    if (pageReloadCount.current > 3) {
      console.warn("Too many page reloads detected. Stopping automatic refresh cycle.");
      sessionStorage.setItem('blockAutoReload', 'true');
      
      // Reset the counter after 2 minutes to allow retry
      setTimeout(() => {
        sessionStorage.removeItem('blockAutoReload');
        sessionStorage.setItem('pageReloadCount', '0');
      }, 120000);
    }

    return () => {
      // Clean up resources
      isMounted.current = false;
      subscription.unsubscribe();
      
      // Clear safety timeout
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Clear refresh interval
      if (refreshTimerRef.current) {
        window.clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [fetchUserRole, setupSessionRefresh, authError]);

  return { session, loading, userRole, authError };
};
