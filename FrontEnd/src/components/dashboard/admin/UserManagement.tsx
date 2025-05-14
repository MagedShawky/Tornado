
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserFilters } from "./user-management/UserFilters";
import { UserTable } from "./user-management/UserTable";
import { AddUserDialog } from "./user-management/AddUserDialog";

type UserRole = "customer" | "agent" | "admin";

interface User {
  id: string;
  email: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  company?: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log("Fetching users...");
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      console.log("Fetched users:", data);
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Filter users based on search query and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchUsers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <AddUserDialog onUserAdded={fetchUsers} />
        </div>
      </div>
      
      <UserFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
      />
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <UserTable 
          users={users} 
          setUsers={setUsers} 
          filteredUsers={filteredUsers} 
        />
      )}
    </div>
  );
}
