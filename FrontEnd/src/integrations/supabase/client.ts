
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jpgdtopuuzlzxbnvodfk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwZ2R0b3B1dXpsenhibnZvZGZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyMDk2OTIsImV4cCI6MjA1MDc4NTY5Mn0.AaBQLIPoAqr6-kVOzyZza9jtIeqnvwhfBNqEumZ6M8w";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true, 
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'boat-management-auth-token',
      flowType: 'implicit'
    },
    global: {
      headers: {
        'apikey': SUPABASE_ANON_KEY
      }
    },
    // Increase timeout for queries
    realtime: {
      timeout: 120000 // Increase from 60s to 120s
    }
  }
);

// Helper function to safely get data from a Supabase query
export async function safeQueryData<T>(promise: Promise<{ data: T | null; error: any }>): Promise<T | null> {
  try {
    const { data, error } = await promise;
    if (error) {
      console.error('Supabase query error:', error);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Unexpected error in Supabase query:', error);
    return null;
  }
}

// Function to check and refresh session if needed
export async function checkAndRefreshSession() {
  try {
    // First try to get the current session
    const { data } = await supabase.auth.getSession();
    
    if (!data.session) {
      console.log("No active session found");
      return false;
    }
    
    // Check if token is close to expiry (within 10 minutes)
    const expiresAt = data.session.expires_at;
    if (expiresAt) {
      const expiryTimestamp = expiresAt * 1000; // convert to milliseconds
      const currentTime = Date.now();
      const tenMinutes = 10 * 60 * 1000;
      
      if (expiryTimestamp - currentTime < tenMinutes) {
        console.log("Session nearing expiry, refreshing token");
        const { data: refreshData, error } = await supabase.auth.refreshSession();
        if (error) {
          console.error("Failed to refresh token:", error);
          return false;
        }
        console.log("Session refreshed successfully");
        return !!refreshData.session;
      }
    }
    
    // Session exists and is not close to expiry
    return true;
  } catch (error) {
    console.error("Error checking session:", error);
    return false;
  }
}

// New function for proactive session refresh without page reload
export async function proactiveSessionRefresh() {
  try {
    const { data: refreshData, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error("Proactive session refresh failed:", error);
      return false;
    }
    console.log("Proactive session refresh successful");
    return !!refreshData.session;
  } catch (error) {
    console.error("Error during proactive session refresh:", error);
    return false;
  }
}
