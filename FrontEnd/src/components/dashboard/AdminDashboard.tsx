
import { useState } from "react";
import { User, Pencil, UserPlus, UserX, ClipboardList, BanknoteIcon, Clock, CalendarIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "./admin/UserManagement";
import { ActivityLogs } from "./admin/ActivityLogs";
import { PendingPayments } from "./admin/PendingPayments";
import { ProfileEditor } from "./admin/ProfileEditor";
import { RecentBookings } from "./admin/RecentBookings";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <User className="mr-2 h-5 w-5" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Add, edit, or remove users and manage their roles.</p>
          </CardContent>
          <CardFooter>
            <button 
              className="text-sm text-blue-600 hover:underline"
              onClick={() => setActiveTab("users")}
            >
              Manage Users →
            </button>
          </CardFooter>
        </Card>
        
        <Card className="bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <ClipboardList className="mr-2 h-5 w-5" />
              Activity Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">View all system activities including bookings and payments.</p>
          </CardContent>
          <CardFooter>
            <button 
              className="text-sm text-green-600 hover:underline"
              onClick={() => setActiveTab("logs")}
            >
              View Logs →
            </button>
          </CardFooter>
        </Card>
        
        <Card className="bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Review and process pending payments from agents and customers.</p>
          </CardContent>
          <CardFooter>
            <button 
              className="text-sm text-amber-600 hover:underline"
              onClick={() => setActiveTab("payments")}
            >
              View Payments →
            </button>
          </CardFooter>
        </Card>
        
        <Card className="bg-purple-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Pencil className="mr-2 h-5 w-5" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Update your profile information and preferences.</p>
          </CardContent>
          <CardFooter>
            <button 
              className="text-sm text-purple-600 hover:underline"
              onClick={() => setActiveTab("profile")}
            >
              Edit Profile →
            </button>
          </CardFooter>
        </Card>
        
        <Card className="bg-rose-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5" />
              Recent Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">View and manage the most recent bookings in the system.</p>
          </CardContent>
          <CardFooter>
            <button 
              className="text-sm text-rose-600 hover:underline"
              onClick={() => setActiveTab("bookings")}
            >
              View Bookings →
            </button>
          </CardFooter>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">Logs</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <BanknoteIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Payments</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Bookings</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="p-4 border rounded-md mt-4">
          <UserManagement />
        </TabsContent>
        
        <TabsContent value="logs" className="p-4 border rounded-md mt-4">
          <ActivityLogs />
        </TabsContent>
        
        <TabsContent value="payments" className="p-4 border rounded-md mt-4">
          <PendingPayments />
        </TabsContent>
        
        <TabsContent value="profile" className="p-4 border rounded-md mt-4">
          <ProfileEditor />
        </TabsContent>
        
        <TabsContent value="bookings" className="p-4 border rounded-md mt-4">
          <RecentBookings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
