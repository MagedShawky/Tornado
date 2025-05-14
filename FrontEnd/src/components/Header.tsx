
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Logo } from "./header/Logo";
import { DesktopNavigation } from "./header/DesktopNavigation";
import { MobileNavigation } from "./header/MobileNavigation";
import { SignOutButton } from "./header/SignOutButton";

export function Header() {
  const isMobile = useIsMobile();

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <Logo />
        
        {isMobile ? (
          <MobileNavigation />
        ) : (
          <>
            <DesktopNavigation />
            <div className="ml-auto flex items-center space-x-4">
              <SignOutButton />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
