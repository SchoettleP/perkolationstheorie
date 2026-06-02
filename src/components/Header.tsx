import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-40 w-full transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl border border-border shadow-sm flex items-center justify-center overflow-hidden bg-card">
            <img
              src="/icon.png"
              alt="Perkolation Icon"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="text-md sm:text-lg font-bold font-outfit text-foreground leading-none flex items-center gap-2">
              Waldbrand &amp; Perkolationstheorie
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
              Wissenschaftlicher Simulator für Phasenübergänge
            </p>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
