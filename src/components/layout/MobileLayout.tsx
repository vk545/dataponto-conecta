import { ReactNode } from "react";
import { BottomNavigation } from "./BottomNavigation";
import { TopHeader } from "./TopHeader";

interface MobileLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  showHeader?: boolean;
  showBottomNav?: boolean;
}

export function MobileLayout({ children, showNav = true, showHeader = true, showBottomNav }: MobileLayoutProps) {
  const shouldShowNav = showBottomNav !== undefined ? showBottomNav : showNav;
  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      {showHeader && <TopHeader />}
      <main className={`flex-1 overflow-auto ${shouldShowNav ? 'pb-20' : ''}`}>
        {children}
      </main>
      {shouldShowNav && <BottomNavigation />}
    </div>
  );
}
