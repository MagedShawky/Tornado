
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type UserRole = "customer" | "agent" | "admin";

interface AddUserDialogProps {
  onUserAdded: () => void;
}

export function AddUserDialog({ onUserAdded }: AddUserDialogProps) {
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("customer");
  const [addingUser, setAddingUser] = useState(false);
  
  const handleAddUser = async () => {
    if (!newUserEmail || !newUserPassword) {
      toast.error("Please provide both email and password");
      return;
    }
    
    try {
      setAddingUser(true);
      console.log("Creating user with role:", newUserRole);
      
      // Sign up the user with role metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
        options: { 
          data: { 
            role: newUserRole 
          },
          emailRedirectTo: window.location.origin
        }
      });
      
      if (authError) {
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error("Failed to create user");
      }
      
      console.log("User created successfully:", authData.user.id);
      
      // The trigger should create a profile, but let's double-check
      const { data: profile, error: profileCheckError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single();
      
      // If profile doesn't exist, create it manually
      if (profileCheckError || !profile) {
        console.log("Creating profile manually as fallback");
        // Manually create profile if the trigger hasn't done it yet
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: authData.user.id,
            email: newUserEmail,
            role: newUserRole
          });
        
        if (profileError && !profileError.message.includes('duplicate key')) {
          console.error("Error creating profile:", profileError);
          // Continue anyway as the user was created
        }
      }
      
      toast.success(`User ${newUserEmail} created successfully`);
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole("customer");
      setShowAddUserDialog(false);
      
      // Refresh the user list
      onUserAdded();
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error(`Failed to create user: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setAddingUser(false);
    }
  };

  return (
    <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account with the specified role.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="user@example.com"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              placeholder="********"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <Select 
              value={newUserRole} 
              onValueChange={(value) => setNewUserRole(value as UserRole)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddUser} disabled={addingUser}>
            {addingUser ? "Creating..." : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
