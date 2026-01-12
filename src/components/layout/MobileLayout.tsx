import { ReactNode } from "react";
import { BottomNavigation } from "./BottomNavigation";
import { TopHeader } from "./TopHeader";

interface MobileLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  showHeader?: boolean;
}

export function MobileLayout({ children, showNav = true, showHeader = true }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      {showHeader && <TopHeader />}
      <main className={`flex-1 overflow-auto ${showNav ? 'pb-20' : ''}`}>
        {children}
      </main>
      {showNav && <BottomNavigation />}
    </div>
  );
}
