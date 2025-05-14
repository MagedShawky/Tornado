
import { useBoatStatusUpdater } from "@/hooks/useBoatStatusUpdater";

/**
 * Component that uses the useBoatStatusUpdater hook to check for completed trips
 * and update boat statuses accordingly
 */
export function BoatStatusUpdater() {
  // Use the custom hook to handle boat status updates
  useBoatStatusUpdater();
  
  return null;
}
