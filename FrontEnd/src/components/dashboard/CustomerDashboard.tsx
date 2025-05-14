
import { useState } from "react";
import { Calendar, User, CreditCard, Ship } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function CustomerDashboard() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Customer Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              My Bookings
            </CardTitle>
            <CardDescription>View your current bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Track and manage all your booked trips.</p>
          </CardContent>
          <CardFooter>
            <Button>View Bookings</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Profile
            </CardTitle>
            <CardDescription>Update your profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Edit your personal details and preferences.</p>
          </CardContent>
          <CardFooter>
            <Button>Edit Profile</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Payment History
            </CardTitle>
            <CardDescription>Review your payment history</CardDescription>
          </CardHeader>
          <CardContent>
            <p>View all your past payments and invoices.</p>
          </CardContent>
          <CardFooter>
            <Button>View Payments</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Ship className="mr-2 h-5 w-5" />
              Explore Trips
            </CardTitle>
            <CardDescription>Discover new sailing adventures</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Browse available trips and plan your next adventure.</p>
          </CardContent>
          <CardFooter>
            <Button>Explore Trips</Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="p-8 border rounded-md mt-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Customer Dashboard</h2>
        <p className="text-gray-600 mb-4">
          This is a placeholder for the Customer Dashboard. The full implementation will be added in a future update.
        </p>
        <Button>Back to Home</Button>
      </div>
    </div>
  );
}
