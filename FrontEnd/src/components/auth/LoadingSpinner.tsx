
import { useEffect, useState } from "react";

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner = ({ message = "Loading..." }: LoadingSpinnerProps) => {
  const [extendedLoading, setExtendedLoading] = useState(false);
  
  // Show extended message if loading takes more than 5 seconds
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setExtendedLoading(true);
    }, 5000);
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      <span className="ml-2 mt-3">{message}</span>
      
      {extendedLoading && (
        <div className="mt-4 text-amber-600 max-w-md text-center">
          <p>This is taking longer than expected.</p>
          <p className="mt-2">If loading persists, try refreshing the page or clearing your browser cache.</p>
        </div>
      )}
    </div>
  );
};
