
import React from "react";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading cabin information..." }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <span className="text-gray-700">{message}</span>
      </div>
    </div>
  );
}
