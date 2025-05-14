
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { DateSelection } from "./trip/DateSelection";
import { BoatSelection } from "./trip/BoatSelection";
import { TripDetails } from "./trip/TripDetails";
import { useTripForm } from "@/hooks/useTripForm";
import { useTripMutation } from "@/hooks/useTripMutation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect } from "react";

interface TripFormProps {
  initialData?: any;
}

export function TripForm({ initialData }: TripFormProps) {
  const {
    form,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    availableBoats,
    isLoading,
    allBoats,
    overlappingTrips,
    tripsByBoat,
    allTrips,
    refreshData
  } = useTripForm({ initialData });

  // Add a useEffect to set the boat ID whenever availableBoats loads
  // and we have initial data with a boat_id
  useEffect(() => {
    if (initialData?.boat_id && availableBoats?.length > 0 && !form.getValues("boat_id")) {
      // First check if the boat is in available boats
      const boatExists = availableBoats.some(boat => boat.id === initialData.boat_id);
      
      if (boatExists) {
        // If the boat is available, set it
        form.setValue("boat_id", initialData.boat_id);
      } else if (allBoats?.length > 0) {
        // If the boat isn't in available boats but exists in allBoats,
        // we still need to set it for proper display
        const originalBoat = allBoats.find(boat => boat.id === initialData.boat_id);
        if (originalBoat) {
          console.log("Setting original boat:", originalBoat.name);
          form.setValue("boat_id", initialData.boat_id);
        }
      }
    }
  }, [initialData, availableBoats, allBoats, form]);

  const mutation = useTripMutation({ 
    initialData,
    onSuccess: () => {
      form.reset();
      setStartDate(undefined);
      setEndDate(undefined);
      toast.success(initialData ? "Trip updated successfully" : "Trip created successfully");
    }
  });

  const onSubmit = (formData: any) => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    mutation.mutate({
      formData,
      startDate,
      endDate,
      availableBoats: initialData ? [...(availableBoats || []), ...(allBoats?.filter(boat => boat.id === initialData.boat_id) || [])] : availableBoats
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <DateSelection
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />

        {startDate && endDate && (
          <ScrollArea className="max-h-[80vh]">
            <BoatSelection 
              form={form} 
              availableBoats={availableBoats} 
              isLoading={isLoading}
              allBoats={allBoats}
              overlappingTrips={overlappingTrips}
              startDate={startDate}
              endDate={endDate}
              tripsByBoat={tripsByBoat}
              allTrips={allTrips}
              editingTripId={initialData?.id}
            />
            <TripDetails form={form} />

            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending || (!initialData && !availableBoats?.length)}
            >
              {mutation.isPending ? "Saving..." : initialData ? "Update Trip" : "Create Trip"}
            </Button>
          </ScrollArea>
        )}
      </form>
    </Form>
  );
}
