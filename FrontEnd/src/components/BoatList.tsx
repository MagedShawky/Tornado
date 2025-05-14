
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { DeleteBoatButton } from "./DeleteBoatButton";
import { Button } from "@/components/ui/button";
import { RefreshCw, Pencil } from "lucide-react";
import { Boat } from "@/types/database";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export function BoatList() {
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const getUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        setUserRole(data?.role);
      }
    };

    getUserRole();
  }, []);

  const { data: boats, isLoading, error, refetch } = useQuery({
    queryKey: ["boats"],
    queryFn: async () => {
      console.log("Starting boats fetch...");
      try {
        const session = await supabase.auth.getSession();
        console.log("Current session:", session ? "exists" : "none");

        const { data, error } = await supabase
          .from("boats")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Supabase error fetching boats:", error);
          throw error;
        }

        if (!data) {
          console.log("No data returned from boats query");
          return [];
        }

        const typedBoats = data.map(boat => ({
          ...boat,
          status: boat.status === "active" ? "active" : "inactive" as const
        }));

        console.log("Boats fetched successfully:", typedBoats.length, "boats");
        return typedBoats;
      } catch (error: any) {
        console.error("Detailed error in fetch:", {
          message: error.message,
          stack: error.stack,
          details: error
        });
        
        const errorMessage = error.code === 'NETWORK_ERROR' || error.message?.includes('fetch')
          ? "Unable to connect to the server. Please check your internet connection."
          : error.message || "Failed to load boats. Please try again.";
        
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden relative animate-pulse">
            <div className="h-48 bg-gray-200" />
            <div className="p-6">
              <div className="h-6 bg-gray-200 rounded w-2/3 mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="max-w-md mx-auto">
          <p className="text-red-500 mb-4 text-lg">
            {error instanceof Error ? error.message : "Unable to load boats"}
          </p>
          {error instanceof Error && error.stack && (
            <pre className="text-left text-sm bg-gray-100 p-4 rounded mb-4 overflow-auto max-h-40 text-gray-600">
              {error.stack}
            </pre>
          )}
          <Button 
            onClick={() => refetch()} 
            variant="outline"
            className="mx-auto flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {boats?.map((boat) => (
        <Card key={boat.id} className="overflow-hidden relative bg-white">
          {/* Only show edit/delete buttons for admin users */}
          {userRole === 'admin' && (
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <Link to={`/edit-boat/${boat.id}`}>
                <Button variant="ghost" size="icon" className="bg-white/80 hover:bg-white">
                  <Pencil className="h-4 w-4" />
                </Button>
              </Link>
              <DeleteBoatButton boatId={boat.id} />
            </div>
          )}
          {boat.feature_photo && (
            <div className="relative w-full h-48">
              <img
                src={boat.feature_photo}
                alt={boat.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{boat.name}</h3>
              <Badge 
                variant={boat.status === "active" ? "default" : "secondary"}
                className="capitalize"
              >
                {boat.status}
              </Badge>
            </div>
            <p className="text-gray-600 mb-6">{boat.description}</p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-gray-500 text-sm">Capacity</p>
                <p className="font-medium">{boat.capacity} people</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Cabins</p>
                <p className="font-medium">{boat.cabin_count}</p>
              </div>
            </div>
          </div>
        </Card>
      ))}
      {boats?.length === 0 && (
        <div className="col-span-full text-center text-gray-500">
          No boats found. Add some boats to see them here.
        </div>
      )}
    </div>
  );
}
