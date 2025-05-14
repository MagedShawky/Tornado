
import { BoatList } from "@/components/BoatList";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "@/hooks/useAuthState";

const Boats = () => {
  const { userRole } = useAuthState();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Boats</h1>
        {userRole === 'admin' && (
          <Button onClick={() => navigate('/add-boat')}>
            Add Boat
          </Button>
        )}
      </div>
      <BoatList />
    </div>
  );
};

export default Boats;
