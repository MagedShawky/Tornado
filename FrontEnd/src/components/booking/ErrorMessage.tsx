
import React from "react";

interface ErrorMessageProps {
  message: string;
  detail?: string;
}

export function ErrorMessage({ message, detail }: ErrorMessageProps) {
  return (
    <div className="container mx-auto py-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h2 className="text-red-800 font-semibold">{message}</h2>
        {detail && <p className="text-red-600">{detail}</p>}
      </div>
    </div>
  );
}
