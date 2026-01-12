import logo from "@/assets/logo-dataponto.png";

export function TopHeader() {
  return (
    <header className="bg-white border-b border-border/50 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <img 
          src={logo} 
          alt="DATAPONTO" 
          className="w-8 h-8"
        />
        <span className="font-bold text-primary text-lg">DATAPONTO</span>
      </div>
    </header>
  );
}
