
import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOutIcon, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function SignOutButton() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  const handleDashboardClick = () => {
    navigate("/dashboard");
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleDashboardClick}
        className="w-full md:w-auto"
      >
        <LayoutDashboard className="mr-2 h-4 w-4" />
        Dashboard
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSignOut}
        className="w-full md:w-auto"
      >
        <LogOutIcon className="mr-2 h-4 w-4" />
        Sign out
      </Button>
    </div>
  );
}
