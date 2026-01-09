import { ReactNode } from "react";
import { BottomNavigation } from "./BottomNavigation";

interface MobileLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

export function MobileLayout({ children, showNav = true }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      <main className={`flex-1 overflow-auto ${showNav ? 'pb-20' : ''}`}>
        {children}
      </main>
      {showNav && <BottomNavigation />}
    </div>
  );
}
