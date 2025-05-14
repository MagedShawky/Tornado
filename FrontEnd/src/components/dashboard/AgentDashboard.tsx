
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Search, Users, UserCog } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProfileEditor } from "@/components/dashboard/admin/ProfileEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AgentDashboard() {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="profile">Profile Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <h1 className="text-3xl font-bold mb-6">Agent Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  View Trips
                </CardTitle>
                <CardDescription>Browse all available trips</CardDescription>
              </CardHeader>
              <CardContent>
                <p>View trip schedules, availability, and details.</p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => navigate('/trips')} variant="outline">
                  View Trips
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="mr-2 h-5 w-5" />
                  Browse Boats
                </CardTitle>
                <CardDescription>View boat information</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Access boat details and specifications.</p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => navigate('/boats')} variant="outline">
                  View Boats
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Manage Bookings
                </CardTitle>
                <CardDescription>View and manage bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Access booking information and passenger details.</p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => navigate('/confirmed-bookings')} variant="outline">
                  View Bookings
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="profile">
          <ProfileEditor />
        </TabsContent>
      </Tabs>
    </div>
  );
}
