
import React from "react";

interface NotFoundMessageProps {
  children: React.ReactNode;
}

export function NotFoundMessage({ children }: NotFoundMessageProps) {
  return (
    <div className="container mx-auto py-8">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h2 className="text-yellow-800 font-semibold">{children}</h2>
        <p className="text-yellow-600">
          The requested trip information could not be found.
        </p>
      </div>
    </div>
  );
}
