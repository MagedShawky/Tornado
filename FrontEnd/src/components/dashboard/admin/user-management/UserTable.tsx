import { useState } from "react";
import { UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EditUserDialog } from "./EditUserDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

interface UserTableProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  filteredUsers: User[];
}

export function UserTable({ users, setUsers, filteredUsers }: UserTableProps) {
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      console.log(`Updating user ${userId} role to ${newRole}`);
      
      // Update the profile record
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      
      toast.success("User role updated successfully");
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    }
  };
  
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setIsDeleting(true);
      console.log(`Attempting to delete user profile for ${userToDelete.id}`);
      
      // First, call our edge function to delete the auth user
      const { error: edgeFunctionError } = await supabase.functions.invoke("delete-user", {
        body: { userId: userToDelete.id }
      });
      
      if (edgeFunctionError) {
        console.error("Error calling delete-user function:", edgeFunctionError);
        throw new Error(`Failed to delete user: ${edgeFunctionError.message}`);
      }
      
      // Delete from profiles table
      const { error: profileDeleteError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userToDelete.id);
      
      if (profileDeleteError) {
        console.error("Error deleting profile:", profileDeleteError);
        // Even if profile deletion fails, the auth user is already deleted,
        // so we should still update the UI
      }
      
      // Update the local state
      setUsers((prev) => prev.filter((user) => user.id !== userToDelete.id));
      
      toast.success(`User ${userToDelete.email} deleted successfully`);
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(`Failed to delete user: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUserUpdate = async () => {
    // Refresh the user list after an update
    // This can be optimized to update only the specific user
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } else {
      setUsers(data || []);
      toast.success("User list updated successfully");
    }
  };

  console.log("Rendering filtered users:", filteredUsers.length);
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>First Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.first_name || 'N/A'}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Select 
                  value={user.role} 
                  onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                >
                  <SelectTrigger className="h-8 w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <EditUserDialog user={user} onUserUpdated={handleUserUpdate} />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-red-600"
                        onClick={() => setUserToDelete(user)}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the user <strong>{userToDelete?.email}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeleteUser} 
                          className="bg-red-600 hover:bg-red-700"
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-4">
              No users found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
