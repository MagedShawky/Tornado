import { BoatForm } from "@/components/BoatForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AddBoat = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/boats')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Boats
        </Button>
        <h1 className="text-3xl font-bold">Add New Boat</h1>
      </div>
      <BoatForm onSuccess={() => navigate('/boats')} />
    </div>
  );
}

export default AddBoat;