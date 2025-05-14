
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { AgentDashboard } from "@/components/dashboard/AgentDashboard";
import { CustomerDashboard } from "@/components/dashboard/CustomerDashboard";

export default function Dashboard() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/auth");
          return;
        }
        
        // Fetch user profile to get role
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
          
        if (error) {
          console.error("Error fetching user profile:", error);
          setUserRole("customer"); // Default to customer if we can't determine role
        } else {
          setUserRole(profile?.role || "customer");
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error in fetchUserRole:", error);
        setLoading(false);
      }
    };
    
    fetchUserRole();
  }, [navigate]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }
  
  // Render the appropriate dashboard based on user role
  return (
    <div className="container mx-auto px-4 py-8">
      {userRole === "admin" && <AdminDashboard />}
      {userRole === "agent" && <AgentDashboard />}
      {userRole === "customer" && <CustomerDashboard />}
      
      {!["admin", "agent", "customer"].includes(userRole || "") && (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Not Available</h1>
          <p className="mt-4 text-gray-600">
            You don't have access to a dashboard. Please contact an administrator.
          </p>
        </div>
      )}
    </div>
  );
}
