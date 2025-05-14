
import React from "react";
import { useNavigate } from "react-router-dom";

export function Logo() {
  const navigate = useNavigate();
  
  return (
    <div 
      className="flex items-center cursor-pointer" 
      onClick={() => navigate("/")}
    >
      <img 
        src="/lovable-uploads/ea922223-62ff-4893-b9f3-547d7283c7f9.png" 
        alt="Tornado Marine Fleet" 
        className="h-10"
      />
    </div>
  );
}
